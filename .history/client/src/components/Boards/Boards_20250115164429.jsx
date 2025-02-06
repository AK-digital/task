"use server";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";
import AddBoard from "./AddBoard";

export default async function Boards({ projectId, boards, project }) {
  return (
    <div className={styles["boards"]}>
      {boards?.map((board) => {
        return (
          <Board
            projectId={projectId}
            board={board}
            project={project}
            key={board?._id}
          />
        );
      })}
    </div>
  );
}
