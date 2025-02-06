"use client";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import { useState } from "react";
import BoardHeader from "./BoardHeader";

export default function Board({ tasks, project, board }) {
  const [open, setOpen] = useState(true);
  const [optimisticColor, setColor] = useState(board?.color);

  return (
    <div className={styles.container} data-board={board?._id}>
      {/* Board header */}
      <BoardHeader
        board={board}
        open={open}
        setOpen={setOpen}
        tasks={tasks}
        setColor={setColor}
        color={color}
      />
      {/* Board content */}
      {open && (
        <Tasks
          tasks={tasks}
          project={project}
          boardId={board?._id}
          color={color}
        />
      )}
    </div>
  );
}
