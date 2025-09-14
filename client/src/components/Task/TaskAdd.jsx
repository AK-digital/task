import React, { useState, useRef, useEffect } from "react";
import { createTask } from "@/api/task";
import socket from "@/utils/socket";
import { mutate } from "swr";

export default function TaskAdd({ boardId, projectId, onTaskCreated, shouldFocus }) {
  const [text, setText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
      // Scroll vers l'input
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [shouldFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isCreating) return;

    setIsCreating(true);

    try {
      const taskData = {
        text: text.trim(),
        boardId: boardId,
      };

      const response = await createTask(taskData, projectId);

      if (response.success) {
        setText("");
        socket.emit("update task", projectId);
        await mutate(`/task?projectId=${projectId}&archived=false`);
        onTaskCreated?.();
      }
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setText("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="task-add-container p-2 border-t border-text-light-color">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ajouter une tâche..."
          disabled={isCreating}
          className="w-full p-2 border border-gray-300 rounded-sm text-normal focus:border-accent-color focus:outline-none bg-secondary"
        />
      </form>
    </div>
  );
}
