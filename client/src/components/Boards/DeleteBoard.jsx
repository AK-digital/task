"use client";
import { deleteBoard } from "@/actions/board";
import { Trash } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../Modals/ConfirmDialog";
import { useTranslation } from "react-i18next";

export default function DeleteBoard({ boardId, projectId }) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDeleteBoard() {
    await deleteBoard(boardId, projectId);
  }

  return (
    <div className="group relative flex items-center text-[#272b4e] cursor-pointer ml-auto transition-[color] duration-200 ease-in-out">
      <Trash
        size={20}
        onClick={() => setShowConfirm(true)}
        className="text-text-color-muted cursor-pointer hover:text-danger-color group-hover:text-danger-color"
      />
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteBoard}
        message={t("boards.delete_board_confirm")}
      />
    </div>
  );
}
