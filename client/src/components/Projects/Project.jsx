"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { useProjectContext } from "@/context/ProjectContext";

const displayedFilters = {
  isSearch: true,
  isProject: false,
  isBoard: false,
  isAdmin: true,
  isStatus: true,
  isPriorities: true,
  isDeadline: true,
};

export default function Project() {
  const { boards, tasks, mutateProject } = useProjectContext();

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
      <ProjectHeader displayedFilters={displayedFilters} />
      <Boards boards={boards} tasksData={tasks} />
    </div>
  );
}
