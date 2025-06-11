"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  getTemplates,
  useTemplate,
  useCustomTemplate,
  deleteTemplate,
  getPublicTemplates,
} from "@/api/template";
import { List, ListTodo, X, Plus } from "lucide-react";
import { usePrivateTemplate } from "@/app/hooks/usePrivateTemplate";
import { usePublicTemplate } from "@/app/hooks/usePublicTemplate";
import { isNotEmpty } from "@/utils/utils";
import { AuthContext } from "@/context/auth";

export default function TemplateProjectStep({ onComplete }) {
  const { uid } = useContext(AuthContext);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  // États pour l'édition
  const [editableProjectName, setEditableProjectName] = useState("");
  const [editableBoards, setEditableBoards] = useState([]);

  // États pour l'édition des titres
  const [editingProjectTitle, setEditingProjectTitle] = useState(false);
  const [editingBoardTitle, setEditingBoardTitle] = useState(null); // index du board en cours d'édition

  const [showPrivateTemplate, setShowPrivateTemplate] = useState(false);

  const { privateTemplates, mutatePrivateTemplates } = usePrivateTemplate(true);
  const { publicTemplates, mutatePublicTemplates } = usePublicTemplate(false);

  console.log(publicTemplates, "publicTemplates");
  console.log(privateTemplates, "privateTemplates");

  // Sélectionner automatiquement le premier template selon l'onglet actuel
  const shouldShowFirstTemplate =
    !selectedTemplate &&
    ((showPrivateTemplate && privateTemplates?.length > 0) ||
      (!showPrivateTemplate && publicTemplates?.length > 0));

  if (shouldShowFirstTemplate) {
    if (showPrivateTemplate && privateTemplates?.length > 0) {
      setTimeout(() => handleTemplateSelect(privateTemplates[0]), 0);
    } else if (!showPrivateTemplate && publicTemplates?.length > 0) {
      setTimeout(() => handleTemplateSelect(publicTemplates[0]), 0);
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);

    // Initialiser les données éditables
    setEditableProjectName(template.name);
    setEditableBoards(
      template.boardsWithTasks?.map((board) => ({
        ...board,
        tasks: board.tasks?.map((task) => ({ ...task })) || [],
      })) || []
    );

    // Réinitialiser les états d'édition
    setEditingProjectTitle(false);
    setEditingBoardTitle(null);
  };

  const handleBackToSelection = () => {
    setShowPreview(false);
    setSelectedTemplate(null);
    setEditableProjectName("");
    setEditableBoards([]);
    setEditingProjectTitle(false);
    setEditingBoardTitle(null);
  };

  const handleProjectNameChange = (e) => {
    setEditableProjectName(e.target.value);
  };

  const handleProjectTitleClick = () => {
    setEditingProjectTitle(true);
  };

  const handleProjectTitleBlur = () => {
    setEditingProjectTitle(false);
  };

  const handleProjectTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      setEditingProjectTitle(false);
    }
  };

  const handleBoardTitleChange = (boardIndex, newTitle) => {
    const updatedBoards = [...editableBoards];
    updatedBoards[boardIndex].title = newTitle;
    setEditableBoards(updatedBoards);
  };

  const handleBoardTitleClick = (boardIndex) => {
    setEditingBoardTitle(boardIndex);
  };

  const handleBoardTitleBlur = () => {
    setEditingBoardTitle(null);
  };

  const handleBoardTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      setEditingBoardTitle(null);
    }
  };

  const handleTaskChange = (boardIndex, taskIndex, newText) => {
    const updatedBoards = [...editableBoards];
    updatedBoards[boardIndex].tasks[taskIndex].text = newText;
    setEditableBoards(updatedBoards);
  };

  const handleDeleteTask = (boardIndex, taskIndex) => {
    const updatedBoards = [...editableBoards];
    updatedBoards[boardIndex].tasks.splice(taskIndex, 1);
    setEditableBoards(updatedBoards);
  };

  const handleAddTask = (boardIndex) => {
    const updatedBoards = [...editableBoards];
    updatedBoards[boardIndex].tasks.push({
      _id: `temp-${Date.now()}`,
      text: "Nouvelle tâche",
    });
    setEditableBoards(updatedBoards);
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le modèle "${templateName}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    setDeletingTemplate(templateId);
    try {
      const result = await deleteTemplate(templateId);
      if (result?.success) {
        // Actualiser les données via les hooks
        mutatePrivateTemplates();
        mutatePublicTemplates();

        // Si le modèle supprimé était sélectionné, réinitialiser la sélection
        if (selectedTemplate?._id === templateId) {
          setSelectedTemplate(null);
          setShowPreview(false);
        }
      } else {
        alert("Erreur lors de la suppression du modèle");
      }
    } catch (error) {
      // console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du modèle");
    } finally {
      setDeletingTemplate(null);
    }
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate || !editableProjectName.trim()) return;

    // Passer les données à l'étape 3
    onComplete({
      type: "template",
      title: editableProjectName,
      boards: editableBoards,
      templateId: selectedTemplate._id,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 h-full max-w-6xl mx-auto">
      {/* Colonne de gauche - Liste des modèles */}
      <div className="flex flex-col gap-4 bg-secondary rounded-xl shadow-sm p-6 overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 text-text-dark-color">
          Modèles Disponible
        </h2>
        <div className="flex items-center justify-center rounded-lg border border-border-color">
          <button
            className={`flex items-center justify-center px-2 py-1 cursor-pointer shadow-none transition-all duration-200 w-full rounded-tl-lg rounded-bl-lg rounded-none ${
              showPrivateTemplate ? "bg-white" : "bg-primary"
            }`}
            onClick={() => {
              setShowPrivateTemplate(false);
              setSelectedTemplate(null);
              setShowPreview(false);
              setEditableProjectName("");
              setEditableBoards([]);
              setEditingProjectTitle(false);
              setEditingBoardTitle(null);
            }}
          >
            <div className="flex justify-center items-center">
              <p className="text-normal font-medium text-text-dark-color">
                La communauté
              </p>
            </div>
          </button>
          <button
            className={`flex items-center justify-center px-2 py-1 cursor-pointer shadow-none transition-all duration-200 w-full rounded-tr-lg rounded-br-lg rounded-none ${
              showPrivateTemplate ? "bg-primary" : "bg-white"
            }`}
            onClick={() => {
              setShowPrivateTemplate(true);
              setSelectedTemplate(null);
              setShowPreview(false);
              setEditableProjectName("");
              setEditableBoards([]);
              setEditingProjectTitle(false);
              setEditingBoardTitle(null);
            }}
          >
            <div className="flex justify-center items-center">
              <p className="text-normal font-medium text-text-dark-color">
                Les vôtres
              </p>
            </div>
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto flex-1">
          <>
            {showPrivateTemplate && privateTemplates?.length > 0 && (
              <>
                <div
                  className={`flex flex-col gap-3 overflow-y-auto flex-1 ${
                    privateTemplates?.length > 5 ? "pr-1" : ""
                  }`}
                >
                  {privateTemplates.map((template) => (
                    <button
                      key={template._id}
                      onClick={() => handleTemplateSelect(template)}
                      type="button"
                      className={`rounded-lg min-h-[100px] p-4 cursor-pointer transition-all duration-200 text-left w-full border border-accent-color ${
                        selectedTemplate?._id === template._id
                          ? "bg-primary shadow-[0_0_0_2px_var(--accent-color)]"
                          : "bg-white hover:bg-primary hover:shadow-md"
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-base font-semibold text-text-dark-color">
                            {template.name}
                          </h4>
                          {template.creator?.picture && (
                            <img
                              src={template.creator.picture}
                              alt={template.creator.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 text-sm text-text-color-muted">
                            <span className="flex items-center gap-1">
                              <List size={16} />
                              {template.boardsCount} tableaux
                            </span>
                            <span className="flex items-center gap-1">
                              <ListTodo size={16} />
                              {template.tasksCount} tâches
                            </span>
                          </div>
                          {template.createdAt && (
                            <div className="text-xs text-text-color-muted">
                              {new Date(template.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {!showPrivateTemplate && publicTemplates?.length > 0 && (
              <>
                <div
                  className={`flex flex-col gap-3 overflow-y-auto flex-1 ${
                    publicTemplates?.length > 5 ? "pr-1" : ""
                  }`}
                >
                  {publicTemplates.map((template) => (
                    <button
                      key={template._id}
                      onClick={() => handleTemplateSelect(template)}
                      type="button"
                      className={`rounded-lg min-h-[100px] p-4 cursor-pointer transition-all duration-200 text-left w-full border border-accent-color ${
                        selectedTemplate?._id === template._id
                          ? "bg-primary shadow-[0_0_0_2px_var(--accent-color)]"
                          : "bg-white hover:bg-primary hover:shadow-md"
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-base font-semibold text-text-dark-color">
                            {template.name}
                          </h4>
                          {template.creator?.picture && (
                            <img
                              src={template.creator.picture}
                              alt={template.creator.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 text-sm text-text-color-muted">
                            <span className="flex items-center gap-1">
                              <List size={16} />
                              {template.boardsCount} tableaux
                            </span>
                            <span className="flex items-center gap-1">
                              <ListTodo size={16} />
                              {template.tasksCount} tâches
                            </span>
                          </div>
                          {template.createdAt && (
                            <div className="text-xs text-text-color-muted">
                              {new Date(template.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {!isNotEmpty(publicTemplates) && !isNotEmpty(privateTemplates) && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-text-color-muted">
                <p className="font-semibold text-text-dark-color mb-2">
                  Aucun modèle disponible
                </p>
                <p className="text-sm leading-relaxed">
                  Créez d'abord des modèles depuis vos projets existants.
                </p>
              </div>
            )}
          </>
        </div>
      </div>

      {/* Colonne de droite - Preview */}
      <div className="bg-secondary rounded-xl shadow-sm p-8 overflow-y-auto relative">
        {!showPreview ? (
          <div className="flex justify-center items-center h-full text-text-color-muted text-lg">
            <p>Sélectionnez un modèle pour voir l'aperçu</p>
          </div>
        ) : (
          selectedTemplate && (
            <div className="absolute inset-0 bg-secondary rounded-xl z-10 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center px-8 pt-8 pb-4 bg-secondary sticky top-0 z-20">
                <h3 className="text-xl font-semibold text-text-dark-color">
                  Aperçu du modèle
                </h3>
                <div className="flex gap-4 items-center">
                  <button
                    className="bg-accent-color text-white border-none rounded-large py-3 px-6 text-medium cursor-pointer transition-all duration-200 font-normal tracking-normal whitespace-nowrap hover:bg-accent-color-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)]"
                    onClick={handleUseTemplate}
                  >
                    Continuer
                  </button>
                </div>
              </div>

              <div className="bg-primary rounded-lg mx-8 mb-4 p-6 shadow-sm relative z-[2] flex-1 overflow-y-auto">
                <div className="text-lg mb-6 pb-4 border-b border-border-color text-text-dark-color flex items-center gap-3">
                  <strong>Nom du projet :</strong>
                  {editingProjectTitle ? (
                    <input
                      type="text"
                      value={editableProjectName}
                      onChange={handleProjectNameChange}
                      onBlur={handleProjectTitleBlur}
                      onKeyDown={handleProjectTitleKeyDown}
                      className="flex-1 bg-secondary border border-border-color rounded-md py-2 px-3 text-base text-text-dark-color transition-all duration-200 focus:outline-none focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(151,112,69,0.1)]"
                      placeholder="Nom du projet"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="flex-1 py-2 px-3 text-base text-text-dark-color cursor-pointer rounded-md transition-all duration-200 bg-transparent hover:bg-primary"
                      onClick={handleProjectTitleClick}
                    >
                      {editableProjectName}
                    </span>
                  )}
                </div>

                {selectedTemplate.description && (
                  <div className="text-base mb-6 pb-4 border-b border-border-color text-text-dark-color">
                    <strong>Description :</strong>{" "}
                    {selectedTemplate.description}
                  </div>
                )}

                {editableBoards?.map((board, i) => (
                  <div key={i} className="mb-6">
                    <div className="mb-3">
                      {editingBoardTitle === i ? (
                        <input
                          type="text"
                          value={board.title}
                          onChange={(e) =>
                            handleBoardTitleChange(i, e.target.value)
                          }
                          onBlur={handleBoardTitleBlur}
                          onKeyDown={handleBoardTitleKeyDown}
                          className="w-full bg-secondary border border-border-color rounded-md py-2 px-3 text-base font-semibold text-accent-color transition-all duration-200 focus:outline-none focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(151,112,69,0.1)]"
                          placeholder="Titre du tableau"
                          autoFocus
                        />
                      ) : (
                        <h4
                          className="text-base font-semibold text-accent-color cursor-pointer py-2 px-3 rounded-md transition-all duration-200 bg-transparent hover:bg-primary"
                          onClick={() => handleBoardTitleClick(i)}
                        >
                          {board.title}
                        </h4>
                      )}
                    </div>
                    <ul className="list-none p-0 m-0 flex flex-col gap-2">
                      {board.tasks?.map((task, j) => (
                        <li
                          key={`${i}-${j}`}
                          className="bg-secondary pl-3 rounded-md shadow-sm flex items-start gap-3"
                        >
                          <input
                            type="text"
                            value={task.text}
                            onChange={(e) =>
                              handleTaskChange(i, j, e.target.value)
                            }
                            className="flex-1 bg-transparent border-none text-sm text-text-dark-color font-inherit leading-relaxed py-3"
                            placeholder="Description de la tâche"
                          />
                          <button
                            className="bg-transparent border-none text-text-color-muted cursor-pointer py-3 px-3 pr-3 rounded border-radius-sm transition-all duration-200 flex items-center justify-center flex-shrink-0 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteTask(i, j)}
                            type="button"
                            title="Supprimer cette tâche"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                      {(!board.tasks || board.tasks.length === 0) && (
                        <li className="bg-secondary py-3 px-3 rounded-md text-sm text-text-color-muted italic text-center">
                          Aucune tâche dans ce tableau
                        </li>
                      )}
                      <li className="mt-2">
                        <button
                          className="bg-transparent border border-dashed border-border-color rounded-md py-3 px-0 w-full text-text-color-muted cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:bg-primary hover:border-accent-color hover:text-accent-color"
                          onClick={() => handleAddTask(i)}
                          type="button"
                        >
                          <Plus size={16} />
                          Ajouter une tâche
                        </button>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>

              {selectedTemplate?.author?.toString() === uid && (
                <a
                  className="text-text-color-red cursor-pointer underline text-small self-start ml-8 mb-4 hover:no-underline"
                  onClick={() =>
                    handleDeleteTemplate(
                      selectedTemplate._id,
                      selectedTemplate.name
                    )
                  }
                  style={{
                    opacity:
                      deletingTemplate === selectedTemplate._id ? 0.6 : 1,
                    pointerEvents:
                      deletingTemplate === selectedTemplate._id
                        ? "none"
                        : "auto",
                  }}
                >
                  {deletingTemplate === selectedTemplate._id
                    ? "Suppression..."
                    : "Supprimer le modèle"}
                </a>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
