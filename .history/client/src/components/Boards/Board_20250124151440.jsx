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
          <span style={{ color: `${board?.colors[0]}` }}>{board?.title}</span>
          <span style={{ backgroundColor: `${board?.colors[0]}` }}></span>
        </div>
      </div>

      {dropdownOpen && (
        <Tasks tasks={tasks} project={project} boardId={board?._id} />
      )}

      {/* <div className={styles["board__header"]}>
        <UpdateBoard board={board} projectId={project?._id} />
        <RemoveBoard boardId={board?._id} projectId={project?._id} />
      </div> */}
      {/* tasks */}
    </div>
  );
}
