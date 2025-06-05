"use client";
import { Plus } from "lucide-react";
import { saveBoard } from "@/api/board";
import { mutate } from "swr";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useState } from "react";
import BoardsTemplateList from "../Templates/BoardsTemplateList";
import AddBoardIAModal from "../Modals/AddBoardIAModal";
import { bricolageGrostesque } from "@/utils/font";

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
    <div className="flex gap-3">
      <button
        type="submit"
        data-disabled={isLoading}
        disabled={isLoading}
        onClick={() => handleAddBoard(project?._id)}
        className="font-bricolage flex justify-center items-center gap-1.5"
      >
        <Plus size={18} />
        Tableau vide
      </button>
      <button
        type="button"
        onClick={() => setAddBoardTemplate(true)}
        className="font-bricolage flex justify-center items-center gap-1.5"
      >
        <Plus size={18} />
        Modèle de tableau
      </button>
      {/* <button
        type="button"
        className="font-bricolage flex justify-center items-center gap-1.5"
        onClick={() => setShowIAModal(true)}
      >
        <Plus size={18} />
        Ajout de tableau par IA
      </button> */}
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
