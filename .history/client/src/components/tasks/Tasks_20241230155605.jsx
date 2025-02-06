"use server";
import styles from "@/styles/components/tasks/tasks.module.css";
import Task from "./Task";

export default async function Tasks({ tasks }) {
  return (
    <div className={styles["tasks"]}>
      <ul className={styles["tasks__list"]}>
        {tasks?.map((task) => {
          return <Task task={task} key={task?._id} />;
        })}
      </ul>
    </div>
  );
}
