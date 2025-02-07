"use server";
import { getProject } from "@/api/project";
import { getBoards } from "@/api/board";
import ProjectHeader from "@/layouts/ProjectHeader";
import styles from "@/styles/pages/project.module.css";
import AddBoard from "@/components/boards/AddBoard";
import Boards from "@/components/boards/Boards";
import { isNotEmpty } from "@/utils/utils";
import TaskMore from "@/components/tasks/TaskMore";
import { getTask } from "@/api/task";

export default async function Project({ params }) {
  const { slug } = await params;
  const id = slug[0];
  const taskUrl = slug[1];
  const taskId = slug[2];
  const isTask = taskUrl === "task";

  const project = await getProject(id);
  const boards = await getBoards(id);
  const task = isTask && taskId ? await getTask(taskId, id) : null;

  return (
    <>
      <main className={styles.main}>
        <ProjectHeader project={project} />
        <div className={styles.container}>
          {isNotEmpty(boards) && <Boards boards={boards} project={project} />}
          <div className={styles.options}>
            <AddBoard projectId={id} />
          </div>
          {isTask && taskId && <TaskMore task={task} project={project} />}
        </div>
      </main>
    </>
  );
}
