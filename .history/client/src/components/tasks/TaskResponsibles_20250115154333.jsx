"use client";

import styles from "@/styles/components/tasks/task-responsibles.module.css";

export default function TaskResponsibles({ task }) {
  const responsibles = task?.responsibles;

  console.log(responsibles);
  return (
    <div className={styles["task__responsibles"]}>
      <ul className={styles["task__list"]}>
        {responsibles.map((responsible) => {
          return <TaskResponsible />;
        })}
      </ul>
    </div>
  );
}

export function TaskResponsible() {
  return <li></li>;
}
