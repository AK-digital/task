import styles from "@/styles/components/task/task-drag.module.css";
import { GripVertical } from "lucide-react";

export default function TaskDrag({ attributes, listeners }) {
  return (
    <div
      className={styles.container}
      id="task-row"
      {...attributes}
      {...listeners}
      suppressHydrationWarning
    >
      <GripVertical size={16} />
    </div>
  );
}
