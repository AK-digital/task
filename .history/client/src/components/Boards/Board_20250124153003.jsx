"use client";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import RemoveBoard from "./RemoveBoard";
import UpdateBoard from "./UpdateBoard";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import BoardHeader from "./BoardHeader";

export default function Board({ tasks, project, board }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={styles.container} data-board={board?._id}>
      {/* Board title */}
      <BoardHeader board={board} open={open} setOpen={setOpen} tasks />

      {open && <Tasks tasks={tasks} project={project} boardId={board?._id} />}

      {/* <div className={styles["board__header"]}>
        <UpdateBoard board={board} projectId={project?._id} />
        <RemoveBoard boardId={board?._id} projectId={project?._id} />
      </div> */}
      {/* tasks */}
    </div>
  );
}
