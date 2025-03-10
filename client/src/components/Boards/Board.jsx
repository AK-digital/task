"use client";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import { useState, useEffect } from "react";
import BoardHeader from "./BoardHeader";

export default function Board({
  tasks,
  project,
  board,
  activeId,
  selectedTasks,
  setSelectedTasks,
  archive,
}) {
  const [open, setOpen] = useState(true);
  const [optimisticColor, setOptimisticColor] = useState(board?.color);

  // Load the stored value after component mounts
  useEffect(() => {
    const storedValue = localStorage.getItem(`board-${board?._id}`);
    if (storedValue !== null) {
      setOpen(JSON.parse(storedValue));
    }
  }, [board?._id]);

  return (
    <div
      className={styles.container}
      data-board={board?._id}
      style={{ borderLeft: `solid 3px ${board?.color}` }}
    >
      {/* Board header - Utilisation de la classe sticky */}
      <div className={styles.headerWrapper}>
        <BoardHeader
          board={board}
          open={open}
          setOpen={setOpen}
          tasks={tasks}
          setOptimisticColor={setOptimisticColor}
          optimisticColor={optimisticColor}
          selectedTasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
          archive={archive}
        />
      </div>
      {/* Board content */}
      {open && (
        <Tasks
          tasks={tasks}
          project={project}
          boardId={board?._id}
          activeId={activeId}
          optimisticColor={optimisticColor}
          selectedTasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
          archive={archive}
        />
      )}
    </div>
  );
}
