"use client";
import { useState, useEffect, useRef, useContext } from "react";
import Task from "./Task";
import SubtaskRow from "./SubtaskRow";
import { createSubtask, getSubtasks, updateSubtask, deleteSubtask, reorderSubtasks } from "@/api/subtask";
import socket from "@/utils/socket";
import { AuthContext } from "@/context/auth";
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
import { Plus } from "lucide-react";

export default function TaskWithSubtasks({ 
  task, 
  displayedElts, 
  setSelectedTasks, 
  selectedTasks,
  isDragging, 
  mutate 
}) {
  const { uid } = useContext(AuthContext);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const taskRef = useRef(null);

  // Fonctions pour gérer la persistance de l'état dans localStorage
  const getStorageKey = () => `subtask_expanded_${uid}_${task._id}`;
  
  const getExpandedStateFromStorage = () => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored === 'true';
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage:', error);
      return false;
    }
  };

  const saveExpandedStateToStorage = (expanded) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getStorageKey(), expanded.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  };

  // État isExpanded avec initialisation depuis localStorage
  const [isExpanded, setIsExpanded] = useState(() => getExpandedStateFromStorage());

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  

  // Synchroniser l'état avec localStorage quand l'utilisateur ou la tâche change
  useEffect(() => {
    if (uid && task._id) {
      const storedState = getExpandedStateFromStorage();
      setIsExpanded(storedState);
    }
  }, [uid, task._id]);

  // Charger les sous-tâches quand on expand
  useEffect(() => {
    if (isExpanded && subtasks.length === 0) {
      loadSubtasks();
    }
    // Toujours afficher le formulaire d'ajout quand on expand
    if (isExpanded) {
      setShowAddForm(true);
    }
  }, [isExpanded]);

  // Écouter les mises à jour via Socket.IO
  useEffect(() => {
    const handleTaskUpdate = () => {
      // Recharger les sous-tâches si elles sont affichées (même si la liste est vide)
      if (isExpanded) {
        loadSubtasks();
      }
    };

    socket.on("update task", handleTaskUpdate);

    return () => {
      socket.off("update task", handleTaskUpdate);
    };
  }, [isExpanded]);

  // Écouter les changements dans selectedTasks pour détecter les suppressions en masse
  const prevSelectedTasksRef = useRef(selectedTasks);
  useEffect(() => {
    const prevSelectedSubtasks = prevSelectedTasksRef.current.filter(item => item.isSubtask);
    const currentSelectedSubtasks = selectedTasks.filter(item => item.isSubtask);
    
    // Si des sous-tâches étaient sélectionnées et ne le sont plus (suppression en masse)
    if (isExpanded && prevSelectedSubtasks.length > 0 && currentSelectedSubtasks.length === 0) {
      // Recharger les sous-tâches après un court délai
      setTimeout(() => {
        loadSubtasks();
      }, 200);
    }
    
    prevSelectedTasksRef.current = selectedTasks;
  }, [selectedTasks, isExpanded]);

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
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    saveExpandedStateToStorage(newExpandedState);
  };

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      const response = await createSubtask(task._id, newSubtaskTitle.trim(), task.projectId._id);
      
      if (response && response.success) {
        setSubtasks([...subtasks, response.data]);
        setNewSubtaskTitle("");
        // Ne pas fermer le formulaire, le garder ouvert pour la prochaine sous-tâche
        
        // Émettre l'événement socket pour notifier les autres utilisateurs
        socket.emit("update task", task.projectId._id || task.projectId);
        
        // Rafraîchir la liste des tâches
        mutate();
      } else {
        console.error("Erreur lors de la création de la sous-tâche:", response?.message || "Réponse invalide");
        // Optionnel : afficher un message d'erreur à l'utilisateur
      }
    } catch (error) {
      console.error("Erreur lors de la création de la sous-tâche:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreateSubtask();
    } else if (e.key === "Escape") {
      setNewSubtaskTitle("");
      // Ne pas fermer le formulaire, juste vider le champ
    }
  };

  const handleSubtaskUpdate = () => {
    // Recharger les sous-tâches après une mise à jour
    loadSubtasks();
    mutate();
  };

  const handleSubtaskDelete = (subtaskId) => {
    // Supprimer la sous-tâche de la liste locale
    setSubtasks(prevSubtasks => prevSubtasks.filter(sub => sub._id !== subtaskId));
    // Notifier la mise à jour de la tâche parent
    mutate();
  };

  // Fonction pour supprimer plusieurs sous-tâches (pour la suppression en masse)
  const handleBulkSubtaskDelete = (subtaskIds) => {
    setSubtasks(prevSubtasks => 
      prevSubtasks.filter(sub => !subtaskIds.includes(sub._id))
    );
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
        
        {/* Tâche principale */}
        <div ref={taskRef}>
          <Task
            task={task}
            displayedElts={displayedElts}
            setSelectedTasks={setSelectedTasks}
            selectedTasks={selectedTasks}
            isDragging={isDragging}
            mutate={mutate}
            // Props pour les sous-tâches
            subtaskCount={subtaskCount}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            handleToggleExpand={() => {
              if (subtaskCount === 0) {
                setShowAddForm(true);
              }
              const newExpandedState = !isExpanded;
              setIsExpanded(newExpandedState);
              saveExpandedStateToStorage(newExpandedState);
            }}
          />
        </div>
      </div>

      {/* Sous-tâches expandables */}
      {isExpanded && (
        <div className="ml-3">
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
                      mutate={mutate}
                      setSelectedTasks={setSelectedTasks}
                      selectedTasks={selectedTasks}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              {/* Formulaire d'ajout de sous-tâche */}
              {showAddForm && (
                <div className="flex items-center gap-2 py-2 px-6">
                  <Plus size={14} className="text-text-color-muted"/>
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      // Ne pas fermer le formulaire au blur, le garder toujours ouvert
                    }}
                    placeholder="Nouvelle sous-tâche..."
                    className="task-col-text text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-accent-color"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateSubtask}
                    disabled={!newSubtaskTitle.trim()}
                    className="secondary-button text-xs py-1.5 hover:text-accent-color-dark disabled:text-gray-400"
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
