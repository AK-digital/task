"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

export function SortableBoard({ children, board, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: board._id,
    data: {
      type: "board",
      board,
    },
  });

  // Ajouter les propriétés de drag pour le drop sur les jalons
  const handleDragStart = (e) => {
    console.log("🚀 [DRAG] Début du drag du board:", board._id);
    e.dataTransfer.setData("text/plain", board._id);
    console.log("🚀 [DRAG] DataTransfer configuré");
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      draggable
      onDragStart={handleDragStart}
      {...props}
    >
      {children}
    </div>
  );
}
