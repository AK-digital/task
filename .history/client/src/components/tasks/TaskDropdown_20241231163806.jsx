import styles from "@/styles/components/tasks/task-dropdown.module.css";

export default function TaskDropdown({ current, values }) {
  return (
    <div>
      <div>
        <span>{current}</span>
      </div>
      <div>
        <ul></ul>
      </div>
    </div>
  );
}
