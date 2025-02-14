"use client";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import { useState, useEffect } from "react";
import BoardHeader from "./BoardHeader";

export default function Board({ tasks, project, board, activeId }) {
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
    <div className={styles.container} data-board={board?._id}>
      {/* Board header */}
      <BoardHeader
        board={board}
        open={open}
        setOpen={setOpen}
        tasks={tasks}
        setOptimisticColor={setOptimisticColor}
        optimisticColor={optimisticColor}
      />
      {/* Board content */}
      {open && (
        <Tasks
          tasks={tasks}
          project={project}
          boardId={board?._id}
          activeId={activeId}
          optimisticColor={optimisticColor}
        />
      )}
    </div>
  );
}
