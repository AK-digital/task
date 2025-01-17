"use server";
import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";

export default async function Boards({ boards, project }) {
  return (
    <div className={styles["boards"]}>
      {boards?.map((board) => {
        return <Board project={project} board={board} key={board?._id} />;
      })}
    </div>
  );
}
