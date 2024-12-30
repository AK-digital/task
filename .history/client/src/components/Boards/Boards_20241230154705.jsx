import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";

export default function Boards({ boards }) {
  return (
    <div className={styles["boards"]}>
      {boards?.map((board) => {
        return <Board board={board} key={board?._id} tasks={filteredTasks} />;
      })}
    </div>
  );
}
