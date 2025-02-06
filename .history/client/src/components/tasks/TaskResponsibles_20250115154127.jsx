import styles from "@/styles/components/tasks/task-responsibles.module.css";

export default function TaskResponsibles({ task }) {
  const responsibles = task?.responsibles;
  return (
    <div>
      <ul>
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
