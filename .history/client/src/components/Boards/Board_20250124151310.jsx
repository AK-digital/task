"use client";
import { getTasks } from "@/api/task";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import RemoveBoard from "./RemoveBoard";
import UpdateBoard from "./UpdateBoard";
import { useState } from "react";

export default function Board({ tasks, project, board }) {
  const [dropdownOpen, setDropdownOpen] = useState(true);
  return (
    <div className={styles.container} data-board={board?._id}>
      {/* Board title */}
      <div className={styles.header}>
        <div>
          <span>{board?.title}</span>
          <span style={{ backgroundColor: `${board?.colors[0]}` }}></span>
        </div>
      </div>

      {/* tasks */}
      {dropdownOpen && (
        <Tasks tasks={tasks} project={project} boardId={board?._id} />
      )}
    </div>
  );
}
