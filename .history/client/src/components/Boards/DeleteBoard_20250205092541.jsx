"use client";
import { deleteBoard } from "@/actions/board";
import { Trash } from "lucide-react";
import { useTransition, useState } from "react";
import ConfirmDialog from "../Modals/ConfirmDialog";
import styles from "@/styles/components/boards/BoardHeader.module.css";

export default function DeleteBoard({ boardId, projectId }) {
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDeleteBoard() {
    await deleteBoard(boardId, projectId);
  }

  return (
    <div className={styles.deleteIcon}>
      <Trash
        size={20}
        onClick={() => setShowConfirm(true)}
        className={styles.trashIcon}
      />
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteBoard}
        message="Supprimer ce tableau ?"
      />
    </div>
  );
}
