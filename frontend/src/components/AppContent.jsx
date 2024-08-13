import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Header from "./Header";
import Board from "./Board";
import TaskDetails from "./TaskDetails";
import InviteUsersDialog from "./shared/InviteUsersDialog";
import { useProjectContext } from "../context/ProjectContext";

function AppContent() {
  const {
    users,
    currentUser,
    projects,
    currentProject,
    setCurrentProject,
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
    handleUpdateBoardTitleColor,
    handleUpdateProjectTitle,
    handleEditResponse,
    handleDeleteResponse,
    handleDeleteProject,
    handleUploadFiles,
    isLoading,
    handleInviteUser,
    handleRevokeUser,
  } = useProjectContext();

  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.currentProjectId && projects.length > 0) {
      const userProject = projects.find(
        (project) => project.id === currentUser.currentProjectId
      );
      if (userProject) {
        setCurrentProject(userProject);
      }
    }
  }, [currentUser, projects, setCurrentProject]);

  useEffect(() => {
    if (currentProject) {
      setNewProjectTitle(currentProject.name);
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentProject && projects.includes(currentProject)) {
      // Assurez-vous que le projet actuel est bien dans la liste des projets
      handleProjectChange({ target: { value: currentProject.id } });
    }
  }, [projects, currentProject, handleProjectChange]);

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

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  // Trouver le propriétaire du projet
  const projectOwner = currentProject
    ? users.find((user) => user.id === currentProject.userId)
    : null;

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
              <div className="project-users">
                {currentProject.guestUsers?.map((guestId) => {
                  const guest = users.find((user) => user.id === guestId);
                  return guest ? (
                    <img
                      key={guest.id}
                      src={`/src/assets/img/${guest.profilePicture}`}
                      alt={guest.name}
                      title={guest.name}
                      className="guest-avatar"
                    />
                  ) : null;
                })}
                {projectOwner && (
                  <img
                    src={`/src/assets/img/${projectOwner.profilePicture}`}
                    alt={projectOwner.name}
                    title={`Propriétaire : ${projectOwner.name}`}
                    className="owner-avatar"
                  />
                )}
              </div>
              {/* Afficher les actions seulement pour le propriétaire */}
              {currentUser && currentProject.userId === currentUser.id && (
                <div className="project-actions">
                  <a
                    href="#"
                    className="project-settings"
                    onClick={() => setIsInviteDialogOpen(true)}
                  >
                    Gérer les invités
                  </a>
                  <span className="separator">|</span>
                  <a
                    className="delete-project-btn"
                    onClick={handleDeleteProjectClick}
                  >
                    Supprimer le projet
                  </a>
                </div>
              )}
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
                    onUpdateColor={(color) =>
                      handleUpdateBoardTitleColor(
                        currentProject.id,
                        board.id,
                        color
                      )
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
      <InviteUsersDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        users={users}
        currentUser={currentUser}
        currentProject={currentProject}
        onInviteUser={handleInviteUser}
        onRevokeUser={handleRevokeUser}
      />
    </div>
  );
}

export default AppContent;
