import { useState } from "react";
import TaskInfo from "../Popups/TaskInfo";

export default function StatusSegment({ status, totalTasks }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const percentage = totalTasks > 0 ? (status?.count / totalTasks) * 100 : 0;

  const handlePopupMouseEnter = (e) => {
    const count = status?.count;
    const name = status?.name?.toLowerCase();
    const taskWord = count === 1 ? "tâche" : "tâches";

    setMessage(`${count} ${taskWord} ${name}`.toLowerCase());
    setIsOpen(true);
  };

  const handlePopupMouseLeave = () => {
    setIsOpen(false);
  };

  // Si le count est 0, ne pas afficher le segment
  if (status?.count === 0) return null;

  return (
    <div
      className="relative h-full transition-width duration-300"
      style={{
        width: `${percentage}%`,
        backgroundColor: status?.color || "#ccc",
      }}
      onMouseEnter={(e) => handlePopupMouseEnter(e)}
      onMouseLeave={handlePopupMouseLeave}
    >
      {isOpen && <TaskInfo message={message} />}
    </div>
  );
}
