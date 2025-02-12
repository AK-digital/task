"use server";
import { getProject } from "@/api/project";
import { getBoards } from "@/api/board";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import { isNotEmpty } from "@/utils/utils";
import AddBoard from "@/components/Boards/AddBoard";
import Boards from "@/components/Boards/Boards";
import { getProjectInvitations } from "@/api/projectInvitation";

export default async function Project({ params }) {
  const { slug } = await params;
  const id = slug[0];

  const project = await getProject(id);
  const projectInvitations = await getProjectInvitations(id);
  const boards = await getBoards(id);

  return (
    <main className={styles.main}>
      <ProjectHeader
        project={project}
        projectInvitations={projectInvitations}
      />
      <div className={styles.container}>
        {isNotEmpty(boards) && <Boards boards={boards} project={project} />}
        <div className={styles.options}>
          <AddBoard projectId={id} />
        </div>
      </div>
    </main>
  );
}
