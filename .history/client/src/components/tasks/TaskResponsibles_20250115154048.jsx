import styles from "@/styles/components/tasks/task-responsibles.module.css";

export default function TaskResponsibles({ task }) {
  const responsibles = task?.responsibles;
  return (
    <div>
      <TaskResponsible />
    </div>
  );
}

export function TaskResponsible() {
  return <ul></ul>;
}
