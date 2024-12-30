"use client";
import { deleteBoard } from "@/api/board";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function RemoveBoard({ boardId, projectId }) {
  async function handleDeleteBoard(e) {
    e.preventDefault();
    await deleteBoard(boardId, projectId);
  }

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
