import { getProject } from "@/api/project";
import { getBoards } from "@/api/board";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import AddBoard from "@/components/boards/AddBoard";
import Boards from "@/components/boards/Boards";

export default async function Project({ params }) {
  const project = await getProject(params.id);
  const boards = await getBoards(params.id);

  return (
    <>
      <main className={styles.main}>
        <ProjectHeader project={project} />
        <div className={styles.container}>
          <Boards boards={boards} project={project} />
          <div className={styles.options}>
            <AddBoard projectId={params.id} />
          </div>
        </div>
      </main>
    </>
  );
}
