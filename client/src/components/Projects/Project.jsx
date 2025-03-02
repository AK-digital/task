"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { revalidateProject } from "@/api/project";

export default function Project({
  project,
  projectInvitations,
  boards,
  tasks,
  archive,
}) {
  useEffect(() => {
    function handleRevalidate(projectId) {
      revalidateProject(projectId);
    }

    socket.on("accepted project invitation", handleRevalidate);

    return () => {
      socket.off("accepted project invitation");
    };
  }, [socket]);

  return (
    <>
      <div className={styles.container}>
        <ProjectHeader
          project={project}
          projectInvitations={projectInvitations}
          tasks={tasks}
        />
        <Boards
          boards={boards}
          project={project}
          tasksData={tasks}
          archive={archive}
        />
      </div>
    </>
  );
}
