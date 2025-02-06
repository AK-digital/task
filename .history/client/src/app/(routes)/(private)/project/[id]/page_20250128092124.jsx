"use server";
import styles from "@/styles/pages/project.module.css";
import { getBoards } from "@/api/board";
import Boards from "@/components/Boards/Boards";
import { getProject } from "@/api/project";
import AddBoard from "@/components/Boards/AddBoard";
import ProjectDelete from "@/components/Projects/ProjectDelete";

export default async function Project({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  const boards = await getBoards(id);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ProjectDelete />
        {boards?.length > 0 && (
          <Boards projectId={id} boards={boards} project={project} />
        )}
        <AddBoard projectId={id} />
      </div>
    </main>
  );
}
