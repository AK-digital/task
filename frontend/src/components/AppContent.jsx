import React, { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Header from "./Header";
import Board from "./Board";
import TaskDetails from "./TaskDetails";
import { useProjectContext } from "../context/ProjectContext";

function AppContent() {
  const {
    users,
    currentUser,
    projects,
    currentProject,
    editingTask,
    handleProjectChange,
    isCreatingProject,
    newProjectName,
    setNewProjectName,
    handleCreateProjectClick,
    handleCreateProject,
    handleCancelCreateProject,
    handleAddTask,
    handleUpdateBoardTitle,
    handleDeleteBoard,
    handleDeleteTask,
    handleAddResponse,
    handleAddBoard,
    handleEditTask,
    handleOpenTaskDetails,
    handleCloseTaskDetails,
    handleSaveTask,
    handleMoveTask,
    handleUpdateProjectTitle,
    handleEditResponse,
    handleDeleteResponse,
    handleDeleteProject,
    handleUploadFiles,
  } = useProjectContext();

  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState(
    currentProject?.name || ""
  );

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    handleMoveTask(
      currentProject.id,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  const handleCreateProjectWithUser = () => {
    if (currentUser) {
      handleCreateProject();
    } else {
      console.error("Utilisateur non défini. Impossible de créer un projet.");
    }
  };

  const handleProjectTitleSubmit = () => {
    if (newProjectTitle.trim() !== "" && currentProject) {
      handleUpdateProjectTitle(currentProject.id, newProjectTitle.trim());
      setIsEditingProjectTitle(false);
    }
  };

  const handleDeleteProjectClick = () => {
    if (currentProject) {
      const isConfirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer le projet "${currentProject.name}" ? Cette action est irréversible.`
      );
      if (isConfirmed) {
        handleDeleteProject(currentProject.id);
      }
    }
  };

  return (
    <div className="app">
      <Header
        projects={projects}
        currentProject={currentProject}
        onProjectChange={handleProjectChange}
        onCreateProject={handleCreateProjectWithUser}
        isCreatingProject={isCreatingProject}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        handleCreateProjectClick={handleCreateProjectClick}
        handleCancelCreateProject={handleCancelCreateProject}
        currentUser={currentUser}
      />
      <main>
        {currentProject ? (
          <>
            <div className="project-header">
              {isEditingProjectTitle ? (
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  onBlur={handleProjectTitleSubmit}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleProjectTitleSubmit()
                  }
                  autoFocus
                />
              ) : (
                <h2
                  className="project-title"
                  onClick={() => {
                    setNewProjectTitle(currentProject.name);
                    setIsEditingProjectTitle(true);
                  }}
                >
                  {currentProject.name}
                </h2>
              )}
              <div className="project-actions">
                <a href="#" className="project-settings">
                  Inviter un utilisateur
                </a>
                <span className="separator">|</span>
                <a
                  className="delete-project-btn"
                  onClick={handleDeleteProjectClick}
                >
                  Supprimer le projet
                </a>
              </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="boards-container">
                {currentProject.boards.map((board, index) => (
                  <Board
                    key={board.id}
                    board={board}
                    index={index}
                    onUpdateTitle={(boardId, newTitle) =>
                      handleUpdateBoardTitle(
                        currentProject.id,
                        boardId,
                        newTitle
                      )
                    }
                    onAddTask={(boardId, task) =>
                      handleAddTask(currentProject.id, boardId, task)
                    }
                    onEditTask={handleEditTask}
                    handleOpenTaskDetails={handleOpenTaskDetails}
                    onDeleteTask={(boardId, taskId) =>
                      handleDeleteTask(currentProject.id, boardId, taskId)
                    }
                    onDeleteBoard={(boardId) =>
                      handleDeleteBoard(currentProject.id, boardId)
                    }
                    users={users || []}
                  />
                ))}
              </div>
            </DragDropContext>
            <button
              className="add-board"
              onClick={() =>
                handleAddBoard(currentProject.id, "Nouveau tableau")
              }
            >
              Ajouter un tableau
            </button>
          </>
        ) : (
          <div className="no-project-content">
            <p>Crée un projet pour commencer.</p>
            <div className="create-project-form">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nom du projet"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateProjectWithUser();
                  }
                }}
              />
              <button onClick={handleCreateProjectWithUser}>Créer</button>{" "}
            </div>
          </div>
        )}
        {editingTask && (
          <TaskDetails
            task={{
              ...editingTask,
              projectId: currentProject?.id,
              boardId: editingTask?.boardId,
            }}
            onClose={handleCloseTaskDetails}
            onSave={(updatedTask) =>
              handleSaveTask(
                currentProject.id,
                editingTask.boardId,
                updatedTask
              )
            }
            onAddResponse={handleAddResponse}
            onEditResponse={handleEditResponse}
            onDeleteResponse={handleDeleteResponse}
            onUploadFiles={(files) =>
              handleUploadFiles(
                files,
                currentUser,
                currentProject,
                editingTask.boardId,
                editingTask.id
              )
            }
            currentUser={currentUser}
            users={users}
          />
        )}
      </main>
    </div>
  );
}

export default AppContent;
