"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { useProject } from "@/app/hooks/useProject";
import { useTasks } from "@/app/hooks/useTasks";
import { useBoards } from "@/app/hooks/useBoards";

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
  const { tasks } = useTasks(initialProject._id, archive, initialTasks);

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
      <ProjectHeader project={project} tasks={tasks} />
      <Boards
        boards={boards}
        project={project}
        tasksData={tasks}
        archive={archive}
      />
    </div>
  );
}
