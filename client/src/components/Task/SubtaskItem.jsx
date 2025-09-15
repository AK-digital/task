"use client";
import { useState, useRef, useEffect } from "react";
import { Trash2, Edit3, Check, X } from "lucide-react";
import moment from "moment";

export default function SubtaskItem({ subtask, onUpdate, onDelete }) {
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
      await onUpdate(subtask._id, { completed: !subtask.completed });
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
      await onUpdate(subtask._id, { title: editTitle.trim() });
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(subtask.title);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDelete = async () => {
    if (isUpdating) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette sous-tâche ?")) {
      setIsUpdating(true);
      try {
        await onDelete(subtask._id);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 ${
      subtask.completed 
        ? "bg-gray-50 border-gray-200" 
        : "bg-white border-gray-200 hover:border-gray-300"
    }`}>
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        disabled={isUpdating}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          subtask.completed
            ? "bg-accent-color border-accent-color text-white"
            : "border-gray-300 hover:border-accent-color"
        } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {subtask.completed && <Check size={12} />}
      </button>

      {/* Titre */}
      <div className="flex-1 min-w-0">
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
          <div className="flex items-center gap-2 group">
            <span
              className={`text-sm cursor-pointer ${
                subtask.completed
                  ? "line-through text-text-color-muted"
                  : "text-text-dark-color"
              }`}
              onClick={() => setIsEditing(true)}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-accent-color"
            >
              <Edit3 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      {isEditing ? (
        <div className="flex items-center gap-1">
          <button
            onClick={handleSaveEdit}
            disabled={!editTitle.trim() || isUpdating}
            className="p-1 text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={isUpdating}
            className="p-1 text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="p-1 text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Informations de completion */}
      {subtask.completed && subtask.completedAt && (
        <div className="text-xs text-text-color-muted">
          {moment(subtask.completedAt).format("DD/MM")}
        </div>
      )}
    </div>
  );
}
