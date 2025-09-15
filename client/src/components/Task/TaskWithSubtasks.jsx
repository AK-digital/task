"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import Task from "./Task";
import SubtaskRow from "./SubtaskRow";
import { createSubtask, getSubtasks, updateSubtask, deleteSubtask } from "@/api/subtask";
import socket from "@/utils/socket";

export default function TaskWithSubtasks({ 
  task, 
  displayedElts, 
  setSelectedTasks, 
  isDragging, 
  mutate 
}) {
  const [subtasks, setSubtasks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  

  // Charger les sous-tâches quand on expand
  useEffect(() => {
    if (isExpanded && subtasks.length === 0) {
      loadSubtasks();
    }
  }, [isExpanded]);

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

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      const response = await createSubtask(task._id, newSubtaskTitle.trim(), task.projectId._id);
      if (response.success) {
        setSubtasks([...subtasks, response.data]);
        setNewSubtaskTitle("");
        setShowAddForm(false);
        
        // Émettre l'événement socket pour notifier les autres utilisateurs
        socket.emit("update task", task.projectId._id || task.projectId);
        
        // Rafraîchir la liste des tâches
        mutate();
      }
    } catch (error) {
      console.error("Erreur lors de la création de la sous-tâche:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreateSubtask();
    } else if (e.key === "Escape") {
      setShowAddForm(false);
      setNewSubtaskTitle("");
    }
  };

  const handleSubtaskUpdate = () => {
    // Recharger les sous-tâches après une mise à jour
    loadSubtasks();
    mutate();
  };

  // Compter les sous-tâches pour l'indicateur
  const subtaskCount = subtasks.length;
  const completedCount = subtasks.filter(sub => sub.completed).length;

  return (
    <>
      {/* Tâche principale avec boutons de contrôle des sous-tâches */}
      <div className="relative group">
        {/* Bouton toggle pour les sous-tâches (à gauche) */}
        {subtaskCount > 0 && (
          <button
            onClick={handleToggleExpand}
            className="subtask-toggle-button absolute left-1 top-1/2 transform -translate-y-1/2 p-1 rounded z-10"
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-gray-600" />
            ) : (
              <ChevronRight size={14} className="text-gray-600" />
            )}
          </button>
        )}
        
        {/* Bouton d'ajout de sous-tâche (visible au survol, à gauche si pas de sous-tâches) */}
        {subtaskCount === 0 && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setIsExpanded(true);
            }}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all text-gray-500 hover:text-accent-color z-10"
            title="Ajouter une sous-tâche"
          >
            <Plus size={14} />
          </button>
        )}
        
        {/* Tâche principale */}
        <Task
          task={task}
          displayedElts={displayedElts}
          setSelectedTasks={setSelectedTasks}
          isDragging={isDragging}
          mutate={mutate}
        />
        
        {/* Indicateur de sous-tâches (à droite) */}
        {subtaskCount > 0 && (
          <div className="subtask-count-indicator absolute right-2 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded-full">
            {completedCount}/{subtaskCount}
          </div>
        )}
      </div>

      {/* Sous-tâches expandables */}
      {isExpanded && (
        <div className="ml-8 border-l-2 border-gray-200">
          {loading ? (
            <div className="py-2 px-4 text-sm text-gray-500">
              Chargement des sous-tâches...
            </div>
          ) : (
            <>
              {subtasks.map((subtask) => (
                <SubtaskRow
                  key={subtask._id}
                  subtask={subtask}
                  onUpdate={handleSubtaskUpdate}
                  displayedElts={displayedElts}
                />
              ))}
              
              {/* Formulaire d'ajout de sous-tâche */}
              {showAddForm && (
                <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 border-b">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (!newSubtaskTitle.trim()) {
                        setShowAddForm(false);
                      }
                    }}
                    placeholder="Nouvelle sous-tâche..."
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-accent-color"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateSubtask}
                    disabled={!newSubtaskTitle.trim()}
                    className="text-sm text-accent-color hover:text-accent-color-dark disabled:text-gray-400"
                  >
                    Ajouter
                  </button>
                </div>
              )}
              
              {subtasks.length === 0 && !showAddForm && (
                <div className="py-2 px-4 text-sm text-gray-500">
                  Aucune sous-tâche
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
