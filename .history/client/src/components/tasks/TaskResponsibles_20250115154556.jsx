"use client";

import styles from "@/styles/components/tasks/task-responsibles.module.css";

export default function TaskResponsibles({ task }) {
  const responsibles = task?.responsibles;

  console.log(responsibles);
  return (
    <div className={styles.container}>
      <ul className={styles.list}>
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
