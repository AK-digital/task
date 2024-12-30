"use client";
import styles from "@/styles/components/boards/remove-board.module.css";
import { deleteBoard } from "@/api/board";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";

export default function RemoveBoard({ boardId, projectId }) {
  async function handleDeleteBoard(e) {
    e.preventDefault();
    await deleteBoard(boardId, projectId);
  }

  useEffect(() => {
    document
      .querySelector(`[data-board=${boardId}]`)
      .addEventListener("onmouseover", function (e) {
        console.log("played");
      });
  }, []);

  return (
    <div className={styles["container"]}>
      <FontAwesomeIcon
        className={styles["container__icon"]}
        icon={faTrash}
        onClick={handleDeleteBoard}
      />
    </div>
  );
}
