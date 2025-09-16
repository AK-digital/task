import { GripVertical } from "lucide-react";

export default function TaskDrag({ attributes, listeners }) {
  return (
    <div
      className="task-col-drag task-content-col text-gray-400 hover:text-gray-600 cursor-grab  active:cursor-grabbing "
      {...attributes}
      {...listeners}
      suppressHydrationWarning
    >
      <GripVertical size={16} />
    </div>
  );
}
