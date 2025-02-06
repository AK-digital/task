import styles from "@/styles/components/tasks/task-responsibles.module.css";

export default function TaskResponsibles({ task }) {
  const responsibles = task?.responsibles;
  return (
    <div>
      <ul>
        <TaskResponsible />
      </ul>
    </div>
  );
}

export function TaskResponsible() {
  return <ul></ul>;
}
