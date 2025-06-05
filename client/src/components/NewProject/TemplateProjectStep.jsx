"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTemplates, useTemplate, useCustomTemplate, deleteTemplate } from "@/api/template";
import { X, Plus, Eye, Users, Calendar } from "lucide-react";
import { mutate } from "swr";

export default function TemplateProjectStep({ onComplete }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  
  // États pour l'édition
  const [editableProjectName, setEditableProjectName] = useState("");
  const [editableBoards, setEditableBoards] = useState([]);
  
  // États pour l'édition des titres
  const [editingProjectTitle, setEditingProjectTitle] = useState(false);
  const [editingBoardTitle, setEditingBoardTitle] = useState(null); // index du board en cours d'édition
  
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getTemplates();
        if (response?.success && response?.data) {
          setTemplates(response.data);
          // Sélectionner le premier modèle par défaut
          if (response.data.length > 0) {
            setSelectedTemplate(response.data[0]);
          }
        } else {
          setError("Aucun modèle disponible");
        }
      } catch (err) {
        setError("Erreur lors du chargement des modèles");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
    
    // Initialiser les données éditables
    setEditableProjectName(template.name);
    setEditableBoards(template.boardsWithTasks?.map(board => ({
      ...board,
      tasks: board.tasks?.map(task => ({ ...task })) || []
    })) || []);
    
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
    if (e.key === 'Enter') {
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
    if (e.key === 'Enter') {
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
      text: "Nouvelle tâche"
    });
    setEditableBoards(updatedBoards);
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${templateName}" ? Cette action est irréversible.`)) {
      return;
    }
    
    setDeletingTemplate(templateId);
    try {
      const result = await deleteTemplate(templateId);
      if (result?.success) {
        // Mettre à jour la liste des modèles
        const updatedTemplates = templates.filter(t => t._id !== templateId);
        setTemplates(updatedTemplates);
        
        // Si le modèle supprimé était sélectionné, réinitialiser la sélection
        if (selectedTemplate?._id === templateId) {
          if (updatedTemplates.length > 0) {
            setSelectedTemplate(updatedTemplates[0]);
            // Garder la preview ouverte avec le nouveau modèle sélectionné
            handleTemplateSelect(updatedTemplates[0]);
          } else {
            setSelectedTemplate(null);
            setShowPreview(false);
          }
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
      type: 'template',
      title: editableProjectName,
      boards: editableBoards,
      templateId: selectedTemplate._id
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-[1fr_2fr] gap-8 h-full max-w-[1200px] mx-auto md:grid-cols-1 md:gap-4">
        {/* Colonne de gauche - Liste des modèles */}
        <div className="bg-secondary rounded-xl shadow-small p-6 flex flex-col overflow-hidden">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 m-0">Modèles disponibles</h3>
          
          {loading && (
            <div className="flex justify-center items-center h-full text-lg text-text-muted">
              Chargement des modèles...
            </div>
          )}
          
          {error && (
            <div className="flex justify-center items-center h-full text-lg text-red-600">
              Erreur lors du chargement
            </div>
          )}
          
          {templates && templates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted">
              <p className="my-2 text-[0.95rem] leading-relaxed first:font-semibold first:text-text-dark">
                Aucun modèle disponible
              </p>
              <p className="my-2 text-[0.95rem] leading-relaxed">
                Créez votre premier projet, puis enregistrez-le comme modèle pour le réutiliser ici.
              </p>
            </div>
          )}
          
          {templates && templates.length > 0 && (
            <div className="flex flex-col gap-3 overflow-y-auto p-1 flex-1">
              {templates.map((template) => (
                <button
                  key={template._id}
                  className={`bg-primary rounded-lg p-4 cursor-pointer transition-all duration-200 text-left w-full shadow-small border-none hover:bg-secondary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
                    selectedTemplate?._id === template._id ? "bg-secondary shadow-[0_0_0_2px_var(--accent-color)]" : ""
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                  type="button"
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-base font-semibold m-0 text-gray-900">
                        {template.name}
                      </h4>
                      {template.creator?.profilePicture && (
                        <img
                          src={template.creator.profilePicture}
                          alt={`Avatar de ${template.creator.firstName || 'Utilisateur'}`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {template.boards?.length || 0} tableau{(template.boards?.length || 0) !== 1 ? 'x' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {template.boards?.reduce((total, board) => total + (board.tasks?.length || 0), 0) || 0} tâche{(template.boards?.reduce((total, board) => total + (board.tasks?.length || 0), 0) || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colonne de droite - Preview */}
        <div className="bg-secondary rounded-xl shadow-small p-8 overflow-y-auto relative">
          {!selectedTemplate ? (
            <div className="flex justify-center items-center h-full text-text-muted text-lg">
              Sélectionnez un modèle pour le prévisualiser
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="border-b border-border pb-4 mb-6">
                <h3 className="text-xl font-semibold m-0 text-gray-900">
                  Aperçu du modèle
                </h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-6">
                <h4 className="text-2xl font-semibold m-0 text-gray-900">
                  {selectedTemplate.name}
                </h4>
                
                {selectedTemplate.description && (
                  <div className="bg-primary p-6 rounded-lg shadow-small">
                    <h5 className="text-base font-semibold mb-3 m-0 text-gray-900">
                      Description
                    </h5>
                    <p className="text-[0.95rem] text-text-muted m-0 leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-8 bg-primary p-6 rounded-lg shadow-small">
                  <div className="flex items-center gap-2 text-text-dark font-medium">
                    <Eye className="text-accent" size={20} />
                    {selectedTemplate.boards?.length || 0} tableau{(selectedTemplate.boards?.length || 0) !== 1 ? 'x' : ''}
                  </div>
                  <div className="flex items-center gap-2 text-text-dark font-medium">
                    <Users className="text-accent" size={20} />
                    {selectedTemplate.boards?.reduce((total, board) => total + (board.tasks?.length || 0), 0) || 0} tâche{(selectedTemplate.boards?.reduce((total, board) => total + (board.tasks?.length || 0), 0) || 0) !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2 text-text-dark font-medium">
                    <Calendar className="text-accent" size={20} />
                    {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <button
                    className="bg-accent text-white border-none rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-normal tracking-normal whitespace-nowrap hover:bg-accent-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)] disabled:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                    onClick={handleUseTemplate}
                    disabled={!selectedTemplate}
                  >
                    Utiliser ce modèle
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPreview && selectedTemplate && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-secondary rounded-xl z-[5] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center py-8 px-8 pb-4 bg-secondary sticky top-0 z-10">
                <h3 className="text-xl font-semibold m-0 text-gray-900">
                  Personnaliser le modèle
                </h3>
                <div className="flex gap-4 items-center">
                  <button
                    className="bg-transparent text-text-muted border border-border rounded-lg py-2 px-4 text-sm cursor-pointer transition-all duration-200 font-normal tracking-normal hover:bg-primary hover:text-text-dark hover:border-accent"
                    onClick={handleBackToSelection}
                    type="button"
                  >
                    Retour
                  </button>
                  <button
                    className="bg-accent text-white border-none rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-normal tracking-normal whitespace-nowrap hover:bg-accent-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)] disabled:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                    onClick={handleUseTemplate}
                    disabled={!selectedTemplate}
                  >
                    Continuer
                  </button>
                </div>
              </div>
              
              {deletingTemplate === selectedTemplate._id && (
                <div className="text-red-600 cursor-pointer underline text-sm self-start ml-8 mb-4 hover:no-underline"
                     onClick={() => handleDeleteTemplate(selectedTemplate._id, selectedTemplate.name)}>
                  Supprimer ce modèle
                </div>
              )}
              
              <div className="bg-primary rounded-lg mx-8 mb-8 p-6 shadow-small relative z-2 flex-1 overflow-y-auto">
                <div className="text-lg mb-6 pb-4 border-b border-border text-text-dark flex items-center gap-3">
                  <strong>Nom du projet :</strong>
                  {editingProjectTitle ? (
                    <input
                      type="text"
                      value={editableProjectName}
                      onChange={handleProjectNameChange}
                      onBlur={handleProjectTitleBlur}
                      onKeyDown={handleProjectTitleKeyDown}
                      className="flex-1 bg-secondary border border-border rounded-md py-2 px-3 text-base text-text-dark transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(151,112,69,0.1)]"
                      placeholder="Nom du projet"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="flex-1 py-2 px-3 text-base text-text-dark cursor-pointer rounded-md transition-all duration-200 hover:bg-primary"
                      onClick={handleProjectTitleClick}
                    >
                      {editableProjectName}
                    </span>
                  )}
                </div>
                
                {selectedTemplate.description && (
                  <div className="text-base mb-6 pb-4 border-b border-border text-text-dark">
                    <strong>Description :</strong> {selectedTemplate.description}
                  </div>
                )}
                
                {editableBoards?.map((board, i) => (
                  <div key={i} className="mb-6">
                    <div className="mb-3">
                      {editingBoardTitle === i ? (
                        <input
                          type="text"
                          value={board.title}
                          onChange={(e) => handleBoardTitleChange(i, e.target.value)}
                          onBlur={handleBoardTitleBlur}
                          onKeyDown={handleBoardTitleKeyDown}
                          className="w-full bg-secondary border border-border rounded-md py-2 px-3 text-base font-semibold text-accent transition-all duration-200 focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(151,112,69,0.1)]"
                          placeholder="Titre du tableau"
                          autoFocus
                        />
                      ) : (
                        <h4 
                          className="text-base font-semibold m-0 text-accent cursor-pointer py-2 px-3 rounded-md transition-all duration-200 hover:bg-primary bg-transparent"
                          onClick={() => handleBoardTitleClick(i)}
                        >
                          {board.title}
                        </h4>
                      )}
                    </div>
                    <ul className="list-none p-0 m-0 flex flex-col gap-2">
                      {board.tasks?.map((task, j) => (
                        <li key={`${i}-${j}`} className="bg-secondary pl-3 rounded-md shadow-small flex items-start gap-3">
                          <input
                            type="text"
                            value={task.text}
                            onChange={(e) => handleTaskChange(i, j, e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm text-text-dark font-inherit leading-relaxed py-3 focus:outline-none"
                            placeholder="Description de la tâche"
                          />
                          <button
                            className="bg-transparent border-none text-text-muted cursor-pointer py-3 pr-3 pl-1 rounded transition-all duration-200 flex items-center justify-center flex-shrink-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteTask(i, j)}
                            type="button"
                            title="Supprimer cette tâche"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                      {(!board.tasks || board.tasks.length === 0) && (
                        <li className="bg-secondary py-3 px-3 rounded-md text-sm text-text-muted italic text-center">Aucune tâche dans ce tableau</li>
                      )}
                      <li className="mt-2">
                        <button
                          className="bg-transparent border border-dashed border-border rounded-md py-3 px-3 w-full text-text-muted cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:bg-primary hover:border-accent hover:text-accent"
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
            </div>
          )}
        </div>
      </div>
    );
  }
  } 