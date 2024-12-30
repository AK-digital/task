import styles from "@/styles/components/boards/boards.module.css";
import Board from "./Board";

export default function Boards({ boards, tasks }) {
  return (
    <div className={styles["boards"]}>
      {boards?.map((board) => {
        const filteredTasks = tasks.filter(
          (task) => task?.boardId === board?._id
        );
        return <Board board={board} key={board?._id} tasks={filteredTasks} />;
      })}
    </div>
  );
}
