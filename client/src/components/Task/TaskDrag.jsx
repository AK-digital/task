import { GripVertical } from "lucide-react";

export default function TaskDrag({ attributes, listeners }) {
  return (
    <div
      className="task-col-drag task-content-col  text-color-border-color"
      {...attributes}
      {...listeners}
      suppressHydrationWarning
    >
      <GripVertical size={16} />
    </div>
  );
}
