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
        <li>hi</li>
        <li>
          <input
            type="text"
            name="new-task"
            id="new-task"
            placeholder="Nouvelle tâche"
          />
        </li>
      </ul>
    </div>
  );
}
