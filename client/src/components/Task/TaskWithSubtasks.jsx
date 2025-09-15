"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import Task from "./Task";
import SubtaskRow from "./SubtaskRow";
import { createSubtask, getSubtasks, updateSubtask, deleteSubtask, reorderSubtasks } from "@/api/subtask";
import socket from "@/utils/socket";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

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
  const taskRef = useRef(null);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  

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

  const handleSubtaskDelete = (subtaskId) => {
    // Supprimer la sous-tâche de la liste locale
    setSubtasks(subtasks.filter(sub => sub._id !== subtaskId));
    // Notifier la mise à jour de la tâche parent
    mutate();
  };

  // Gestion du drag & drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = subtasks.findIndex((item) => item._id === active.id);
      const newIndex = subtasks.findIndex((item) => item._id === over.id);

      const newSubtasks = arrayMove(subtasks, oldIndex, newIndex);
      setSubtasks(newSubtasks);

      // Mettre à jour l'ordre sur le serveur
      try {
        const subtaskIds = newSubtasks.map(sub => sub._id);
        await reorderSubtasks(task._id, subtaskIds);
        socket.emit("update task", task.projectId._id);
      } catch (error) {
        console.error("Erreur lors de la réorganisation des sous-tâches:", error);
        // Revenir à l'ordre précédent en cas d'erreur
        setSubtasks(subtasks);
      }
    }
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
        <div ref={taskRef}>
          <Task
            task={task}
            displayedElts={displayedElts}
            setSelectedTasks={setSelectedTasks}
            isDragging={isDragging}
            mutate={mutate}
          />
        </div>
        
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext
                  items={subtasks.map(sub => sub._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {subtasks.map((subtask) => (
                    <SubtaskRow
                      key={subtask._id}
                      subtask={subtask}
                      onUpdate={handleSubtaskUpdate}
                      onDelete={handleSubtaskDelete}
                      displayedElts={displayedElts}
                      parentTask={task}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
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
