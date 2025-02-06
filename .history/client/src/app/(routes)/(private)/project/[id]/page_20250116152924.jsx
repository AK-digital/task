"use server";
import styles from "@/styles/pages/project.module.css";
import { getBoards } from "@/api/board";
import Boards from "@/components/Boards/Boards";
import { getProject } from "@/api/project";
import AddBoard from "@/components/Boards/AddBoard";
import ProjectDelete from "@/components/Projects/ProjectDelete";
import ProjectGuests from "@/components/Projects/ProjectGuests";

export default async function Project({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  const boards = await getBoards(id);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Project Header */}
        <div className={styles.header}>
          <span className={styles.name}>{project?.name}</span>
          <div className={styles.options}>
            <ProjectGuests project={project} />
            |
            <ProjectDelete project={project} />
          </div>
        </div>
        {/* Boards */}
        {boards?.length > 0 && <Boards projectId={id} boards={boards} />}
        <AddBoard projectId={id} />
      </div>
    </main>
  );
}
