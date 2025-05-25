"use client";
// import styles from "@/styles/components/boards/add-board.module.css";
import { Plus } from "lucide-react";
import { saveBoard } from "@/api/board";
import { mutate } from "swr";
import { bricolageGrostesque } from "@/utils/font";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useState } from "react";
import BoardsTemplateList from "../Templates/BoardsTemplateList";

export default function AddBoard({ project }) {
  const [isLoading, setIsLoading] = useState(false);
  const [addBoardTemplate, setAddBoardTemplate] = useState(false);
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
      {addBoardTemplate && (
        <BoardsTemplateList
          project={project}
          setAddBoardTemplate={setAddBoardTemplate}
        />
      )}
    </div>
  );
}
