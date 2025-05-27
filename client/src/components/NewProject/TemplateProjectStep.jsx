"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTemplates, useTemplate, useCustomTemplate, deleteTemplate } from "@/api/template";
import { List, ListTodo, X, Plus } from "lucide-react";
import styles from "@/styles/components/new-project/template-project-step.module.css";

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
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des modèles...</div>
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Colonne de gauche - Liste des modèles */}
      <div className={styles.templatesColumn}>
        <h3>Modèles disponibles</h3>
        {templates.length === 0 ? (
          <div className={styles.noTemplates}>
            <p>Aucun modèle disponible</p>
            <p>Créez d'abord des modèles depuis vos projets existants.</p>
          </div>
        ) : (
          <div className={styles.templatesList}>
            {templates.map((template) => (
            <button
              key={template._id}
              className={`${styles.templateItem} ${
                selectedTemplate?._id === template._id ? styles.selected : ""
              }`}
              onClick={() => handleTemplateSelect(template)}
              type="button"
            >
              <div className={styles.templateInfo}>
                <div className={styles.templateHeader}>
                  <h4>{template.name}</h4>
                  {template.creator?.picture && (
                    <img 
                      src={template.creator.picture} 
                      alt={template.creator.name}
                      className={styles.creatorAvatar}
                    />
                  )}
                </div>
                <div className={styles.templateMeta}>
                  <div className={styles.templateStats}>
                    <span>
                      <List size={16} />
                      {template.boardsCount} tableaux
                    </span>
                    <span>
                      <ListTodo size={16} />
                      {template.tasksCount} tâches
                    </span>
                  </div>
                  {template.createdAt && (
                    <div className={styles.createdDate}>
                      {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </button>
                      ))}
          </div>
        )}
      </div>

      {/* Colonne de droite - Preview */}
      <div className={styles.previewColumn}>
        {!showPreview ? (
          <div className={styles.noSelection}>
            <p>Sélectionnez un modèle pour voir l'aperçu</p>
          </div>
        ) : (
          selectedTemplate && (
            <div className={styles.templateOverlay}>
              <div className={styles.overlayHeader}>
                <h3>Aperçu du modèle</h3>
                <div className={styles.headerButtons}>
                  <button
                    className={styles.useTemplateButton}
                    onClick={handleUseTemplate}
                  >
                    Continuer
                  </button>
                </div>
              </div>
              
              <div className={styles.templatePreview}>
                <div className={styles.projectTitle}>
                  <strong>Nom du projet :</strong>
                  {editingProjectTitle ? (
                    <input
                      type="text"
                      value={editableProjectName}
                      onChange={handleProjectNameChange}
                      onBlur={handleProjectTitleBlur}
                      onKeyDown={handleProjectTitleKeyDown}
                      className={styles.projectNameInput}
                      placeholder="Nom du projet"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className={styles.projectNameText}
                      onClick={handleProjectTitleClick}
                    >
                      {editableProjectName}
                    </span>
                  )}
                </div>
                
                {selectedTemplate.description && (
                  <div className={styles.projectDescription}>
                    <strong>Description :</strong> {selectedTemplate.description}
                  </div>
                )}
                
                {editableBoards?.map((board, i) => (
                  <div key={i} className={styles.boardPreview}>
                    <div className={styles.boardHeader}>
                      {editingBoardTitle === i ? (
                        <input
                          type="text"
                          value={board.title}
                          onChange={(e) => handleBoardTitleChange(i, e.target.value)}
                          onBlur={handleBoardTitleBlur}
                          onKeyDown={handleBoardTitleKeyDown}
                          className={styles.boardTitleInput}
                          placeholder="Titre du tableau"
                          autoFocus
                        />
                      ) : (
                        <h4 
                          className={styles.boardTitleText}
                          onClick={() => handleBoardTitleClick(i)}
                        >
                          {board.title}
                        </h4>
                      )}
                    </div>
                    <ul className={styles.tasksList}>
                      {board.tasks?.map((task, j) => (
                        <li key={`${i}-${j}`} className={styles.taskItem}>
                          <input
                            type="text"
                            value={task.text}
                            onChange={(e) => handleTaskChange(i, j, e.target.value)}
                            className={styles.taskInput}
                            placeholder="Description de la tâche"
                          />
                          <button
                            className={styles.deleteTaskButton}
                            onClick={() => handleDeleteTask(i, j)}
                            type="button"
                            title="Supprimer cette tâche"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                      {(!board.tasks || board.tasks.length === 0) && (
                        <li className={styles.emptyTasks}>Aucune tâche dans ce tableau</li>
                      )}
                      <li className={styles.addTaskItem}>
                        <button
                          className={styles.addTaskButton}
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
                
                {error && <div className={styles.error}>{error}</div>}
              </div>
              
              <a
                className={styles.deleteTemplateLink}
                onClick={() => handleDeleteTemplate(selectedTemplate._id, selectedTemplate.name)}
                style={{ opacity: deletingTemplate === selectedTemplate._id ? 0.6 : 1, pointerEvents: deletingTemplate === selectedTemplate._id ? 'none' : 'auto' }}
              >
                {deletingTemplate === selectedTemplate._id ? "Suppression..." : "Supprimer le modèle"}
              </a>
            </div>
          )
        )}
      </div>
    </div>
  );
} 