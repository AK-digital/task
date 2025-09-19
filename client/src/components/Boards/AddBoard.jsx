"use client";
import { Plus } from "lucide-react";
import { saveBoard } from "@/api/board";
import { mutate } from "swr";
import { useUserRole } from "../../../hooks/useUserRole";
import { useState, memo, useCallback } from "react";
import BoardsTemplateList from "../Templates/BoardsTemplateList";
import AddBoardIAModal from "../Modals/AddBoardIAModal";
import Sidebar from "../Sidebar/Sidebar";
import { bricolageGrostesque } from "@/utils/font";

const AddBoard = memo(function AddBoard({ project, onBoardCreated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(false);
  const [showIAModal, setShowIAModal] = useState(false);
  const isAuthorized = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  const handleAddBoard = useCallback(async (projectId) => {
    setIsLoading(true);
    const response = await saveBoard(projectId);

    if (!response.success) {
      setIsLoading(false);
      return;
    }

    await mutate(`/boards?projectId=${projectId}&archived=false`);

    setIsLoading(false);
    
    // Fermer le modal si la fonction est fournie
    if (onBoardCreated) {
      onBoardCreated();
    }
  }, [onBoardCreated]);

  if (!isAuthorized) return null;

  return (
    <div className="flex gap-3">
      <button
        type="submit"
        data-disabled={isLoading}
        disabled={isLoading}
        onClick={() => handleAddBoard(project?._id)}
        className="secondary-button"
      >
        <Plus size={18} />
        Tableau vide
      </button>
      <button
        type="button"
        onClick={() => setShowTemplateSidebar(true)}
        className="secondary-button"
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
      {showIAModal && (
        <AddBoardIAModal
          project={project}
          onClose={() => setShowIAModal(false)}
        />
      )}
      
      {/* Sidebar pour les modèles de tableaux */}
      <Sidebar
        isOpen={showTemplateSidebar}
        onClose={() => setShowTemplateSidebar(false)}
        title="Modèles de tableaux"
        width="600px"
      >
        <BoardsTemplateList
          project={project}
          setAddBoardTemplate={() => setShowTemplateSidebar(false)}
          inSidebar={true}
        />
      </Sidebar>
    </div>
  );
});

export default AddBoard;
