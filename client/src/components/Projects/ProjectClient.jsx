"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import { isNotEmpty } from "@/utils/utils";
import AddBoard from "@/components/Boards/AddBoard";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { revalidateProject } from "@/api/project";

export default function ProjectClient({ project, projectInvitations, boards }) {
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
      <ProjectHeader
        project={project}
        projectInvitations={projectInvitations}
      />
      <div className={styles.container}>
        {isNotEmpty(boards) && <Boards boards={boards} project={project} />}
        <div className={styles.options}>
          <AddBoard projectId={project?._id} />
        </div>
      </div>
    </>
  );
}
