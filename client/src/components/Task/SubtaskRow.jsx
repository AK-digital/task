"use client";
import { useState, useRef, useEffect } from "react";
import { Check, Edit3, Trash2, X } from "lucide-react";
import { updateSubtask, deleteSubtask } from "@/api/subtask";
import moment from "moment";

export default function SubtaskRow({ subtask, onUpdate, displayedElts }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef(null);
  

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

  const handleDelete = async () => {
    if (isUpdating) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette sous-tâche ?")) {
      setIsUpdating(true);
      try {
        const response = await deleteSubtask(subtask._id);
        if (response.success) {
          onUpdate();
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      } finally {
        setIsUpdating(false);
      }
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

  return (
    <div className={`subtask-row flex items-center border-t border-gray-100 h-[40px] transition-colors group ${
      subtask.completed ? 'opacity-75' : ''
    }`}>
      {/* Checkbox */}
      <div className="task-col-checkbox flex items-center justify-center px-2">
        <button
          onClick={handleToggleComplete}
          disabled={isUpdating}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
            subtask.completed
              ? "bg-accent-color border-accent-color text-white"
              : "border-gray-300 hover:border-accent-color"
          } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {subtask.completed && <Check size={10} />}
        </button>
      </div>

      {/* Drag placeholder (pour l'alignement) */}
      {displayedElts.isDrag && (
        <div className="task-col-drag w-8"></div>
      )}

      {/* Titre de la sous-tâche */}
      <div className="task-col-text flex-1 px-3">
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

      {/* Conversation placeholder */}
      <div className="task-col-conversation w-12"></div>

      {/* Subtasks indicator placeholder */}
      <div className="task-col-subtasks w-16"></div>

      {/* Colonnes conditionnelles (pour l'alignement avec les tâches principales) */}
      {displayedElts.isProject && <div className="task-col-project w-32"></div>}
      {displayedElts.isBoard && <div className="task-col-board w-32"></div>}
      {displayedElts.isAdmin && <div className="task-col-responsibles w-32"></div>}
      {displayedElts.isStatus && <div className="task-col-status w-32"></div>}
      {displayedElts.isPriority && <div className="task-col-priority w-32"></div>}
      {displayedElts.isDeadline && <div className="task-col-deadline w-32"></div>}
      {displayedElts.isEstimate && <div className="task-col-estimate w-32"></div>}
      {displayedElts.isTimer && <div className="task-col-timer w-32"></div>}

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
