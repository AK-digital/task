"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { Check, Edit3, Trash2, X, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateSubtask, deleteSubtask } from "@/api/subtask";
import moment from "moment";
import { AuthContext } from "@/context/auth";
import TaskProject from "./TaskProject";
import TaskBoard from "./TaskBoard";
import TaskResponsibles from "./TaskResponsibles";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskEstimate from "./TaskEstimate";
import TaskTimer from "./TaskTimer";
import TaskConversation from "./TaskConversation";

export default function SubtaskRow({ subtask, onUpdate, onDelete, displayedElts, parentTask }) {
  const { uid, user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef(null);

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
    projectId: parentTask?.projectId,
    boardId: parentTask?.boardId,
    status: subtask.status,
    priority: subtask.priority,
    deadline: subtask.deadline,
    estimation: subtask.estimation,
    responsibles: subtask.responsibles || [],
    messages: subtask.messages || [],
    // Marquer comme sous-tâche pour les composants
    isSubtask: true,
  };
  

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggleComplete = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await updateSubtask(subtask._id, { 
        completed: !subtask.completed 
      });
      if (response.success) {
        onUpdate();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`subtask-row flex items-center border-t border-gray-100 h-[40px] transition-colors group ${
        subtask.completed ? 'opacity-75' : ''
      } ${isDragging ? 'opacity-50 z-50' : ''}`}
    >

      {/* Drag Handle */}
      {displayedElts.isDrag && (
        <div className="task-col-drag w-8 flex items-center justify-center">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical size={14} />
          </button>
        </div>
      )}

      {/* Titre de la sous-tâche */}
      <div className="task-col-text px-3" style={{ width: 'var(--task-col-text-width, auto)' }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="w-full text-sm border-none outline-none bg-transparent"
            disabled={isUpdating}
          />
        ) : (
          <div className="flex items-center gap-2 group/title">
            <span
              className={`text-sm cursor-pointer ${
                subtask.completed
                  ? "line-through text-gray-500"
                  : "text-gray-700"
              }`}
              onClick={() => setIsEditing(true)}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 hover:text-accent-color"
            >
              <Edit3 size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Conversation */}
      <TaskConversation task={taskLikeSubtask} uid={uid} />

      {/* Colonnes conditionnelles avec les vrais composants */}
      {displayedElts.isProject && <TaskProject task={taskLikeSubtask} />}
      {displayedElts.isBoard && <TaskBoard task={taskLikeSubtask} />}
      {displayedElts.isAdmin && <TaskResponsibles task={taskLikeSubtask} uid={uid} user={user} />}
      {displayedElts.isStatus && <TaskStatus task={taskLikeSubtask} />}
      {displayedElts.isPriority && <TaskPriority task={taskLikeSubtask} />}
      {displayedElts.isDeadline && <TaskDeadline task={taskLikeSubtask} uid={uid} />}
      {displayedElts.isEstimate && <TaskEstimate task={taskLikeSubtask} uid={uid} />}
      {displayedElts.isTimer && <TaskTimer task={taskLikeSubtask} />}

      {/* Actions */}
      <div className="flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDelete}
          disabled={isUpdating}
          className="p-1 text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Info de completion */}
      {subtask.completed && subtask.completedAt && (
        <div className="text-xs text-gray-500 px-2">
          {moment(subtask.completedAt).format("DD/MM")}
        </div>
      )}
    </div>
  );
}
