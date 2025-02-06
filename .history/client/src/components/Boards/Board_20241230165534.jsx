"use server";
import { getTasks } from "@/api/task";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import RemoveBoard from "./RemoveBoard";

export default async function Board({ projectId, board }) {
  const tasks = await getTasks(projectId, board?._id);

  return (
    <div className={styles["board"]} data-board={board?._id}>
      {/* Board title */}
      <div className={styles["board__header"]}>
        <div>
          <span>{board?.title}</span>
        </div>
        <RemoveBoard boardId={board?._id} projectId={projectId} />
      </div>
      {/* tasks */}
      {tasks?.length > 0 && <Tasks tasks={tasks} />}
    </div>
  );
}
