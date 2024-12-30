import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";

export default function Boards({ boards, tasks }) {
  console.log(tasks);

  return (
    <div className={styles["boards"]}>
      {boards?.map((board) => {
        tasks.filter((task) => task?.boardId === board?._id);
        return <Board board={board} key={board?._id} />;
      })}
    </div>
  );
}
