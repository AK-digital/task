import styles from "@/styles/components/projects/statusSegment.module.css";
import { useState } from "react";
import TaskInfo from "../Popups/TaskInfo";

export default function StatusSegment({ count, totalTasks, status }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const percentage = (count / totalTasks) * 100;

  const statusColors = {
    "En attente": "#b3bcc0",
    "À estimer": "#62c3b0",
    "En cours": "#f3b158",
    "À faire": "#559fc6",
    "À vérifier": "#9d88c2",
    Bloquée: "#ca4250",
    Terminée: "#63a758",
  };

  const handlePopupMouseEnter = (e, status, count) => {
    const taskWord = count === 1 ? "tâche" : "tâches";
    const statusWord =
      status.toLowerCase() === "terminée" && count > 1
        ? "terminées"
        : status.toLowerCase();

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
        backgroundColor: statusColors[status] || "#ccc",
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
