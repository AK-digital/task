"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import Boards from "@/components/Boards/Boards";
import { useEffect, useState } from "react";
import socket from "@/utils/socket";
import { useProject } from "@/app/hooks/useProject";
import { useTasks } from "@/app/hooks/useTasks";
import { useBoards } from "@/app/hooks/useBoards";

const displayedFilters = {
  isSearch: true,
  isProject: false,
  isBoard: false,
  isAdmin: true,
  isStatus: true,
  isPriorities: true,
  isDeadline: true,
};

export default function Project({
  initialProject,
  initialBoards,
  initialTasks,
  archive,
}) {
  // Fetch data using SWR and passing initial data as fallback
  const { project, mutateProject } = useProject(
    initialProject._id,
    initialProject
  );
  const { boards } = useBoards(initialProject._id, archive, initialBoards);
  const [queries, setQueries] = useState({
    projectId: initialProject?._id,
    archived: archive,
  });

  const { tasks, mutateTasks } = useTasks(queries, initialTasks);

  useEffect(() => {
    function handleRevalidate() {
      mutateProject();
    }

    socket.on("accepted project invitation", handleRevalidate);

    return () => {
      socket.off("accepted project invitation");
    };
  }, [socket]);

  return (
    <div className={styles.container}>
      <ProjectHeader
        project={project}
        tasks={tasks}
        displayedFilters={displayedFilters}
        queries={queries}
        setQueries={setQueries}
        mutateProject={mutateProject}
      />
      <Boards
        boards={boards}
        project={project}
        tasksData={tasks}
        mutateTasks={mutateTasks}
        archive={archive}
      />
    </div>
  );
}
