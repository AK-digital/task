import styles from "@/styles/components/projects/statusSegment.module.css";
import { useState } from "react";
import TaskInfo from "../Popups/TaskInfo";

export default function StatusSegment({
  count,
  totalTasks,
  status,
  statusColor,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const percentage = (count / totalTasks) * 100;

  const handlePopupMouseEnter = (e, status, count) => {
    const taskWord = count === 1 ? "tâche" : "tâches";
    const statusWord = status.toLowerCase();

    setMessage(`${count} ${taskWord} ${statusWord}`);
    setIsOpen(true);
  };

  const handlePopupMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      key={status}
      className={styles.statusSegment}
      style={{
        width: `${percentage}%`,
        backgroundColor: statusColor || "#ccc",
      }}
      onMouseEnter={(e) => handlePopupMouseEnter(e, status, count)}
      onMouseLeave={handlePopupMouseLeave}
    >
      {isOpen && (
        <div>
          <TaskInfo message={message} />
        </div>
      )}
    </div>
  );
}
