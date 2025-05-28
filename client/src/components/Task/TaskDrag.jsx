import styles from "@/styles/components/task/task-drag.module.css";
import { GripVertical } from "lucide-react";

export default function TaskDrag({ attributes, listeners }) {
  return (
    <div
      className="flex items-center h-full pl-1.5 text-color-border-color"
      {...attributes}
      {...listeners}
      suppressHydrationWarning
    >
      <GripVertical size={16} />
    </div>
  );
}
