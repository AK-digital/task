"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateSubtask, deleteSubtask } from "@/api/subtask";
import { AuthContext } from "@/context/auth";
import { useTaskContext } from "@/context/TaskContext";
import TaskContextMenu from "./TaskContextMenu";
import TaskProject from "./TaskProject";
import TaskBoard from "./TaskBoard";
import TaskResponsibles from "./TaskResponsibles";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskEstimate from "./TaskEstimate";
import TaskTimer from "./TaskTimer";
import TaskConversation from "./TaskConversation";
import TaskCheckbox from "./TaskCheckbox";
import TaskDrag from "./TaskDrag";

export default function SubtaskRow({ subtask, onUpdate, onDelete, displayedElts, parentTask, mutate, setSelectedTasks, selectedTasks }) {
  const { uid, user } = useContext(AuthContext);
  const { setOpenedTask } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  // Drag & Drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Extraire les éléments à afficher depuis displayedElts
  const {
    isCheckbox,
    isDrag,
    isProject,
    isBoard,
    isAdmin,
    isStatus,
    isPriority,
    isDeadline,
    isEstimate,
    isTimer,
  } = displayedElts || {};

  // Créer un objet task-like pour les composants existants
  const taskLikeSubtask = {
    ...subtask,
    _id: subtask._id,
    taskId: subtask.taskId || parentTask?._id, // ID de la tâche parente pour les drafts/messages
    projectId: parentTask?.projectId, // Garder la structure complète pour TaskMore
    boardId: parentTask?.boardId,
    status: subtask.status,
    priority: subtask.priority,
    deadline: subtask.deadline,
    estimation: subtask.estimation,
    responsibles: subtask.responsibles || [],
    messages: subtask.messages || [],
    // Description pour TaskMore (structure identique aux tâches)
    description: subtask.description || {
      text: "",
      author: subtask.author,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
      reactions: [],
      files: []
    },
    // Marquer comme sous-tâche pour les composants
    isSubtask: true,
    parentTask: parentTask, // Référence vers la tâche parent
  };


  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Nettoyage du timeout au démontage
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);


  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle === subtask.title || isUpdating) {
      setIsEditing(false);
      setEditTitle(subtask.title);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateSubtask(subtask._id, {
        title: editTitle.trim()
      });
      if (response.success) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsUpdating(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(subtask.title);
    }
  };

  const handleDelete = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await deleteSubtask(subtask._id);
      if (response.success) {
        onDelete?.(subtask._id);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleConversationClick = () => {
    // Créer un objet tâche-like pour la sous-tâche
    const subtaskAsTask = {
      ...subtask,
      isSubtask: true,
      parentTask: parentTask
    };
    setOpenedTask(subtaskAsTask);
  };

  const handleTitleClick = () => {
    // Annuler le timeout précédent s'il existe
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Programmer l'édition avec un délai pour permettre le double-clic
    clickTimeoutRef.current = setTimeout(() => {
      setIsEditing(true);
    }, 300);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Annuler le timeout de simple clic
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Ouvrir la sous-tâche en double-cliquant
    const subtaskAsTask = {
      ...subtask,
      isSubtask: true,
      parentTask: parentTask
    };
    setOpenedTask(subtaskAsTask);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`subtask-row flex items-center border-t border-gray-100 h-[40px] transition-colors group cursor-pointer ${subtask.completed ? 'opacity-75' : ''
        } ${isDragging ? 'opacity-50 z-50' : ''}`}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >

      {/* Checkbox */}
      {displayedElts.isCheckbox && (
        <TaskCheckbox task={taskLikeSubtask} setSelectedTasks={setSelectedTasks} selectedTasks={selectedTasks} />
      )}

      {/* Drag Handle */}
      {displayedElts.isDrag && (
        <div className="ml-1">
          <TaskDrag attributes={attributes} listeners={listeners} />
        </div>
      )}

      {/* Titre de la sous-tâche */}
      <div className="task-col-text task-content-col px-1 cursor-text" onClick={() => setIsEditing(true)}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="relative text-normal tracking-[0.01em] border border-accent-color focus:text-text-darker-color focus:rounded-sm font-bricolage w-full px-2 py-1 rounded-sm bg-third"
            disabled={isUpdating}
            autoFocus
          />
        ) : (
          <span
            className={`block overflow-hidden whitespace-nowrap text-ellipsis text-normal tracking-[0.01em] border border-transparent px-2 py-1 rounded-sm transition-all duration-200 hover:bg-third hover:border-gray-300 ${subtask.completed
                ? "line-through text-gray-500"
                : ""
              }`}
            onClick={handleTitleClick}
            onDoubleClick={handleDoubleClick}
          >
            {subtask.title}
          </span>
        )}
      </div>

      {/* Conversation */}
      <TaskConversation task={taskLikeSubtask} uid={uid} onClick={handleConversationClick} />

      {/* Colonnes conditionnelles avec les vrais composants */}
      {displayedElts.isProject && <TaskProject task={taskLikeSubtask} />}
      {displayedElts.isBoard && <TaskBoard task={taskLikeSubtask} />}
      {displayedElts.isAdmin && <TaskResponsibles task={taskLikeSubtask} uid={uid} user={user} />}
      {displayedElts.isStatus && <TaskStatus task={taskLikeSubtask} />}
      {displayedElts.isPriority && <TaskPriority task={taskLikeSubtask} />}
      {displayedElts.isDeadline && <TaskDeadline task={taskLikeSubtask} uid={uid} />}
      {displayedElts.isEstimate && <TaskEstimate task={taskLikeSubtask} uid={uid} />}
      {displayedElts.isTimer && <TaskTimer task={taskLikeSubtask} />}

      {/* Menu contextuel */}
      <TaskContextMenu
        isOpen={contextMenuOpen}
        setIsOpen={setContextMenuOpen}
        position={contextMenuPosition}
        task={taskLikeSubtask}
        mutate={mutate}
        onDelete={onDelete}
      />
    </div>
  );
}
