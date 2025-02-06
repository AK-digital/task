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
    <div className={styles["board"]} data-board={board?._id}>
      {/* Board title */}
      <div className={styles["board__header"]}>
        <UpdateBoard board={board} projectId={project?._id} />
        <RemoveBoard boardId={board?._id} projectId={project?._id} />
      </div>
      {/* tasks */}
      {dropdownOpen && (
        <Tasks tasks={tasks} project={project} boardId={board?._id} />
      )}
    </div>
  );
}
