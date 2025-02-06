"use server";
import { getTasks } from "@/api/task";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import RemoveBoard from "./RemoveBoard";
import UpdateBoard from "./UpdateBoard";

export default async function Board({ project, board }) {
  const tasks = await getTasks(project?._id, board?._id);

  return (
    <div
      className={styles["board"]}
      data-board={board?._id}
      style={{
        boxShadow: `-2px 0 0 ${board?.color}`,
      }}
    >
      {/* Board title */}
      <div className={styles["board__header"]}>
        <UpdateBoard board={board} projectId={project?._id} />
        <RemoveBoard boardId={board?._id} projectId={project?._id} />
      </div>
      {/* tasks */}
      {/* <Tasks tasks={tasks} project={project} boardId={board?._id} /> */}
    </div>
  );
}
