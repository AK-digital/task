"use client";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";

export default function Boards({ boards, project }) {
  return (
    <div className={styles["boards"]}>
      {/* Si boards est un tableau, on itère dessus correctement */}
      {boards?.map((board) => {
        return (
          <Board
            project={project}
            board={board}
            key={board?._id} // Clé unique sur chaque board
          />
        );
      })}
    </div>
  );
}
