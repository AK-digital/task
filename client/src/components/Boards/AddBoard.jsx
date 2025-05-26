"use client";
import styles from "@/styles/components/boards/add-board.module.css";
import { Plus } from "lucide-react";
import { saveBoard } from "@/api/board";
import { mutate } from "swr";
import { bricolageGrostesque } from "@/utils/font";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useState } from "react";
import BoardsTemplateList from "../Templates/BoardsTemplateList";
import AddBoardIAModal from "../Modals/AddBoardIAModal";

export default function AddBoard({ project }) {
  const [isLoading, setIsLoading] = useState(false);
  const [addBoardTemplate, setAddBoardTemplate] = useState(false);
  const [showIAModal, setShowIAModal] = useState(false);
  const isAuthorized = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleAddBoard(projectId) {
    setIsLoading(true);
    const response = await saveBoard(projectId);

    if (!response.success) return;

    await mutate(`/boards?projectId=${projectId}&archived=false`);

    setIsLoading(false);
  }

  if (!isAuthorized) return null;

  return (
    <div className={styles.container}>
      <button
        type="submit"
        className={bricolageGrostesque.className}
        data-disabled={isLoading}
        disabled={isLoading}
        onClick={() => handleAddBoard(project?._id)}
      >
        <Plus size={18} />
        Tableau vide
      </button>
      <button
        type="button"
        className={bricolageGrostesque.className}
        onClick={() => setAddBoardTemplate(true)}
      >
        <Plus size={18} />
        Modèle de tableau
      </button>
      <button
        type="button"
        className={bricolageGrostesque.className}
        onClick={() => setShowIAModal(true)}
      >
        <Plus size={18} />
        Ajout de tableau par IA
      </button>
      {addBoardTemplate && (
        <BoardsTemplateList
          project={project}
          setAddBoardTemplate={setAddBoardTemplate}
        />
      )}
      {showIAModal && (
        <AddBoardIAModal
          project={project}
          onClose={() => setShowIAModal(false)}
        />
      )}
    </div>
  );
}
