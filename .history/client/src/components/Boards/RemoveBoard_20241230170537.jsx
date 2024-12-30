"use client";
import styles from "@/styles/components/boards/remove-board.module.css";
import { deleteBoard } from "@/api/board";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";

export default function RemoveBoard({ boardId, projectId }) {
  const iconRef = useRef(null);
  async function handleDeleteBoard(e) {
    e.preventDefault();
    await deleteBoard(boardId, projectId);
  }

  useEffect(() => {
    const board = document.querySelector(`[data-board="${boardId}"]`);
    board.addEventListener("mouseenter", function (e) {
      iconRef.current.classList.add(styles.active);
    });
    board.addEventListener("mouseleave", function (e) {
      iconRef.current.classList.remove(styles.active);
    });
  }, []);

  return (
    <div className={styles["container"]} ref={iconRef}>
      <FontAwesomeIcon
        className={styles["container__icon"]}
        icon={faTrash}
        onClick={handleDeleteBoard}
      />
    </div>
  );
}
