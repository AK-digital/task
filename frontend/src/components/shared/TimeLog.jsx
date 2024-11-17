import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useModal } from '../../hooks/useModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { updateTask } from '../../store/slices/taskSlice';
import { dateUtils } from '../../utils/dateUtils';
import { formatters } from '../../utils/formatters';

const TimeLog = ({ task, boardId }) => {
  const appDispatch = useAppDispatch();
  const { showConfirmation } = useModal();
  const currentUser = useSelector(state => state.auth.currentUser);
  const currentProject = useSelector(state => state.projects.currentProject);

  const [isOpen, setIsOpen] = useState(false);
  const [newLogHours, setNewLogHours] = useState("");
  const [editingLogId, setEditingLogId] = useState(null);

  const totalHours = task.timeLogs?.reduce((acc, log) =>
    acc + parseFloat(log.hours), 0
  ) || 0;

  const handleAddLog = async () => {
    if (!newLogHours.trim() || isNaN(parseFloat(newLogHours))) return;

    try {
      const hours = parseFloat(newLogHours);
      if (hours <= 0 || hours > 24) {
        throw new Error("Les heures doivent être comprises entre 0 et 24");
      }

      const newLog = {
        id: Date.now(),
        userId: currentUser.id,
        name: currentUser.name,
        hours: hours,
        date: new Date().toISOString()
      };

      await appDispatch(
        updateTask({
          projectId: currentProject.id,
          boardId,
          taskId: task.id,
          updates: {
            timeLogs: [...(task.timeLogs || []), newLog]
          }
        }),
        {
          successMessage: "Temps ajouté avec succès",
          errorMessage: "Erreur lors de l'ajout du temps"
        }
      );

      setNewLogHours("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du log:", error);
    }
  };

  const handleEditLog = async (logId, newHours) => {
    try {
      const updatedLogs = task.timeLogs.map(log =>
        log.id === logId ? { ...log, hours: parseFloat(newHours) } : log
      );

      await appDispatch(
        updateTask({
          projectId: currentProject.id,
          boardId,
          taskId: task.id,
          updates: { timeLogs: updatedLogs }
        }),
        {
          successMessage: "Temps modifié avec succès",
          errorMessage: "Erreur lors de la modification du temps"
        }
      );

      setEditingLogId(null);
    } catch (error) {
      console.error("Erreur lors de la modification du log:", error);
    }
  };

  const handleDeleteLog = (logId) => {
    showConfirmation(
      "Êtes-vous sûr de vouloir supprimer cette entrée de temps ?",
      async () => {
        try {
          const updatedLogs = task.timeLogs.filter(log => log.id !== logId);

          await appDispatch(
            updateTask({
              projectId: currentProject.id,
              boardId,
              taskId: task.id,
              updates: { timeLogs: updatedLogs }
            }),
            {
              successMessage: "Temps supprimé avec succès",
              errorMessage: "Erreur lors de la suppression du temps"
            }
          );
        } catch (error) {
          console.error("Erreur lors de la suppression du log:", error);
        }
      }
    );
  };

  return (
    <div className="time-log">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="time-log-dropdown-btn"
      >
        <FontAwesomeIcon icon={faClock} />
        <span>Total: {formatters.formatHours(totalHours)}</span>
      </button>

      {isOpen && (
        <div className="time-log-dropdown">
          <ul className="time-log-list">
            {task.timeLogs?.map((log) => (
              <li key={log.id} className="time-log-item">
                {editingLogId === log.id ? (
                  <div className="time-log-edit">
                    <input
                      type="number"
                      value={newLogHours}
                      onChange={(e) => setNewLogHours(e.target.value)}
                      min="0"
                      max="24"
                      step="0.5"
                    />
                    <button
                      onClick={() => handleEditLog(log.id, newLogHours)}
                      className="save-btn"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingLogId(null)}
                      className="cancel-btn"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="time-log-view">
                    <div className="log-info">
                      <span className="user-name">{log.name}</span>
                      <span className="hours">{formatters.formatHours(log.hours)}</span>
                      <span className="date">
                        {dateUtils.formatDate(log.date)}
                      </span>
                    </div>

                    {log.userId === currentUser.id && (
                      <div className="log-actions">
                        <button
                          onClick={() => {
                            setEditingLogId(log.id);
                            setNewLogHours(log.hours.toString());
                          }}
                          className="edit-btn"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="delete-btn"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="time-log-input">
            <input
              type="number"
              value={newLogHours}
              onChange={(e) => setNewLogHours(e.target.value)}
              placeholder="Heures"
              min="0"
              max="24"
              step="0.5"
            />
            <button onClick={handleAddLog}>Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeLog;