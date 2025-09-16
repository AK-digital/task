"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import { createSubtask, getSubtasks, updateSubtask, deleteSubtask, reorderSubtasks } from "@/api/subtask";
import socket from "@/utils/socket";
import SubtaskItem from "./SubtaskItem";

export default function Subtasks({ task, project }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  

  // Charger les sous-tâches
  useEffect(() => {
    loadSubtasks();
  }, [task._id]);

  const loadSubtasks = async () => {
    setLoading(true);
    try {
      const response = await getSubtasks(task._id);
      if (response.success) {
        setSubtasks(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sous-tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await createSubtask(task._id, newSubtaskTitle.trim(), task.projectId._id);
      if (response.success) {
        setSubtasks([...subtasks, response.data]);
        setNewSubtaskTitle("");
        setIsAdding(false);
        
        // Émettre l'événement socket pour notifier les autres utilisateurs
        socket.emit("update task", project._id);
      }
    } catch (error) {
      console.error("Erreur lors de la création de la sous-tâche:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSubtask = async (subtaskId, updates) => {
    try {
      const response = await updateSubtask(subtaskId, updates);
      if (response.success) {
        setSubtasks(subtasks.map(sub => 
          sub._id === subtaskId ? response.data : sub
        ));
        
        // Émettre l'événement socket pour notifier les autres utilisateurs
        socket.emit("update task", project._id);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la sous-tâche:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const response = await deleteSubtask(subtaskId);
      if (response.success) {
        setSubtasks(subtasks.filter(sub => sub._id !== subtaskId));
        
        // Émettre l'événement socket pour notifier les autres utilisateurs
        socket.emit("update task", project._id);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la sous-tâche:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreateSubtask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewSubtaskTitle("");
    }
  };

  const completedCount = subtasks.filter(sub => sub.completed).length;
  const totalCount = subtasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="subtasks-section">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-medium text-text-dark-color">Sous-tâches</h4>
        </div>
        <div className="text-sm text-text-color-muted">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="subtasks-section">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-medium text-text-dark-color">
          Sous-tâches
          {totalCount > 0 && (
            <span className="ml-2 text-sm text-text-color-muted">
              ({completedCount}/{totalCount})
            </span>
          )}
        </h4>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-sm text-accent-color hover:text-accent-color-dark transition-colors"
          >
            <Plus size={16} />
            Ajouter
          </button>
        )}
      </div>

      {/* Barre de progression */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-text-color-muted mb-1">
            <span>Progression</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent-color h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Liste des sous-tâches */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask._id}
            subtask={subtask}
            onUpdate={handleUpdateSubtask}
            onDelete={handleDeleteSubtask}
          />
        ))}

        {/* Formulaire d'ajout */}
        {isAdding && (
          <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Titre de la sous-tâche..."
              className="flex-1 text-sm border-none outline-none bg-transparent"
              autoFocus
              disabled={isCreating}
            />
            <div className="flex items-center gap-1">
              <button
                onClick={handleCreateSubtask}
                disabled={!newSubtaskTitle.trim() || isCreating}
                className="p-1 text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewSubtaskTitle("");
                }}
                disabled={isCreating}
                className="p-1 text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Message si aucune sous-tâche */}
        {totalCount === 0 && !isAdding && (
          <div className="text-center py-6 text-text-color-muted">
            <p className="text-sm">Aucune sous-tâche pour le moment</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-sm text-accent-color hover:text-accent-color-dark"
            >
              Créer la première sous-tâche
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
