"use server";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";
import { getTasks } from "@/api/task";

export default async function Boards({ boards, project }) {
  return (
    <div className={styles["boards"]}>
      {boards?.map(async (board) => {
        const tasks = await getTasks(project?._id, board?._id);

        return (
          <Board
            tasks={tasks}
            project={project}
            board={board}
            key={board?._id}
          />
        );
      })}
    </div>
  );
}
