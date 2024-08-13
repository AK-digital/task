import React, { useState } from "react";
import "../../assets/css/timelog.css";

function TimeLog({ task, currentUser, onEditTask }) {
  const [newLog, setNewLog] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAddLog = () => {
    if (!newLog.trim()) return;

    const updatedLogs = [
      ...task.timeLogs,
      {
        userId: currentUser.id,
        name: currentUser.name,
        hours: newLog.trim(),
        date: new Date().toISOString(),
      },
    ];

    onEditTask(task.id, { ...task, timeLogs: updatedLogs });
    setNewLog("");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="time-log">
      <button onClick={toggleDropdown} className="time-log-dropdown-btn">
        Logs de temps
      </button>
      {isDropdownOpen && (
        <div className="time-log-dropdown">
          <ul className="time-log-list">
            {task.timeLogs.map((log, index) => (
              <li key={index} className="time-log-item">
                <span>
                  {log.name}: {log.hours} heures
                </span>
                <span className="time-log-date">
                  ({new Date(log.date).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
          <div className="time-log-input">
            <input
              type="number"
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
              placeholder="Ajouter des heures"
              min="0"
            />
            <button onClick={handleAddLog}>Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeLog;
