"use client";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import { useState } from "react";
import BoardHeader from "./BoardHeader";
import useSWR from "swr";

export default function Board({ tasks, project, board }) {
  const [open, setOpen] = useState(true);
  const [optimisticColor, setOptimisticColor] = useState(board?.color);

  const { data, error } = useSWR(
    `task?projectId=${project?._id}&boardId=${board?._id}`,
    () => getTasks(project?._id, board?._id)
  );
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
          optimisticColor={optimisticColor}
        />
      )}
    </div>
  );
}
