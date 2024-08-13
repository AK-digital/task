import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';
import { v4 as uuid } from 'uuid';

const API_BASE_URL = "http://localhost:5001/api";

function useProjects() {
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (url, options = {}) => {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    };

    const fetchCurrentUser = useCallback(async () => {
        const token = Cookies.get("authToken");
        if (token) {
            try {
                const users = await fetchData(`${API_BASE_URL}/users`);
                const user = users.find(u => u.authToken === token);
                if (user) {
                    setCurrentUser(user);
                    return user;
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur courant: ', error);
            }
        }
        return null;
    }, []);

    const fetchProjects = useCallback(async (user) => {
        try {
            // Récupérer tous les projets
            const allProjects = await fetchData(`${API_BASE_URL}/projects`);

            // Filtrer les projets possédés par l'utilisateur
            const ownedProjects = allProjects.filter(project => project.userId === user.id);

            // Filtrer les projets où l'utilisateur est invité
            const invitedProjects = allProjects.filter(project =>
                project.guestUsers && project.guestUsers.includes(user.id)
            );

            // Combiner les projets possédés et invités
            const combinedProjects = [...ownedProjects, ...invitedProjects];
            setProjects(combinedProjects);

            // Définir le projet actuel basé sur currentProjectId de l'utilisateur
            if (user.currentProjectId) {
                const currentProject = combinedProjects.find(project => project.id === user.currentProjectId);
                if (currentProject) {
                    setCurrentProject(currentProject);
                } else if (combinedProjects.length > 0) {
                    // Si le currentProjectId n'existe pas, on prend le premier projet
                    setCurrentProject(combinedProjects[0]);
                }
            } else if (combinedProjects.length > 0) {
                // Si pas de currentProjectId, on prend le premier projet
                setCurrentProject(combinedProjects[0]);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
        }
    }, []);

    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            const user = await fetchCurrentUser();
            if (user) {
                await fetchProjects(user);
                await fetchUsers();
            }
            setIsLoading(false);
        };

        initializeData();
    }, [fetchCurrentUser, fetchProjects]);

    const fetchUsers = async () => {
        try {
            const data = await fetchData(`${API_BASE_URL}/users`);
            setUsers(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
    };

    const handleProjectChange = async (e) => {
        const projectId = e.target.value;
        const selectedProject = projects.find(p => p.id === projectId);
        setCurrentProject(selectedProject);

        if (currentUser) {
            try {
                await fetchData(`${API_BASE_URL}/users/${currentUser.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentProjectId: projectId })
                });
            } catch (error) {
                console.error('Erreur lors de la mise à jour du projet actuel:', error);
            }
        }
    };

    const handleCreateProject = async () => {
        if (newProjectName.trim() && currentUser) {
            try {
                const newProject = {
                    id: uuid().toString(),
                    name: newProjectName.trim(),
                    boards: [
                        {
                            id: uuid().toString(),
                            title: "Tableau par défaut",
                            tasks: [],
                        },
                    ],
                    userId: currentUser.id,
                };
                console.log(newProject);
                const data = await fetchData(`${API_BASE_URL}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProject),
                });

                // Ajouter le nouveau projet à la liste et le sélectionner
                setProjects((prevProjects) => [...prevProjects, data]);
                setCurrentProject(data); // Sélection du projet nouvellement créé

                setNewProjectName('');
                setIsCreatingProject(false);
            } catch (error) {
                console.error('Erreur lors de la création du projet:', error);
            }
        }
    };


    const handleCreateProjectClick = () => {
        setIsCreatingProject(true);
    };

    const handleCancelCreateProject = () => {
        setNewProjectName('');
        setIsCreatingProject(false);
    };

    const handleUpdateProjectTitle = async (projectId, newTitle) => {
        if (currentProject && currentProject.id === projectId) {
            try {
                const updatedProject = { ...currentProject, name: newTitle };
                const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);
                setProjects(prevProjects => prevProjects.map(project =>
                    project.id === projectId ? response.data : project
                ));
                setCurrentProject(response.data);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du titre du projet:', error);
            }
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            await axios.delete(`${API_BASE_URL}/projects/${projectId}`);

            setProjects(prevProjects => {
                const updatedProjects = prevProjects.filter(project => project.id !== projectId);

                if (currentProject && currentProject.id === projectId) {
                    const deletedIndex = prevProjects.findIndex(p => p.id === projectId);

                    if (updatedProjects.length > 0) {
                        const nextProjectIndex = deletedIndex < updatedProjects.length ? deletedIndex : deletedIndex - 1;
                        setCurrentProject(updatedProjects[nextProjectIndex]);
                    } else {
                        setCurrentProject(null);
                    }
                }

                return updatedProjects;
            });

        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
        }
    };

    /*
    * BOARD FUNCTIONS
    */
    const handleAddBoard = async (projectId, title) => {
        try {
            const project = projects.find(p => p.id.toString() === projectId.toString());
            const newBoard = {
                id: uuid().toString(),
                title,
                tasks: []
            };
            const updatedProject = {
                ...project,
                boards: [...project.boards, newBoard]
            };
            const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);

            setProjects(prevProjects =>
                prevProjects.map(p => p.id.toString() === projectId.toString() ? response.data : p)
            );
            setCurrentProject(response.data);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du tableau:', error);
        }
    };

    const handleDeleteBoard = async (projectId, boardId) => {
        if (currentProject) {
            try {
                // Filtrer le tableau à supprimer
                const updatedBoards = currentProject.boards.filter(board => board.id !== boardId);

                const updatedProject = {
                    ...currentProject,
                    boards: updatedBoards
                };

                const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);

                setProjects(prevProjects => prevProjects.map(project =>
                    project.id === projectId ? response.data : project
                ));
                setCurrentProject(response.data);

                // Si nous éditons une tâche qui était dans le tableau supprimé, fermons l'éditeur
                if (editingTask && !updatedBoards.some(board => board.tasks.some(task => task.id === editingTask.id))) {
                    setEditingTask(null);
                }
            } catch (error) {
                console.error('Erreur lors de la suppression du tableau:', error);
            }
        }
    };

    const handleUpdateBoardTitle = async (projectId, boardId, newTitle) => {
        try {
            const project = projects.find(p => p.id === projectId);
            const updatedProject = {
                ...project,
                boards: project.boards.map(b => b.id === boardId ? { ...b, title: newTitle } : b)
            };
            const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);
            setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? response.data : p));
            setCurrentProject(response.data);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du titre du tableau:', error);
        }
    };

    const handleAddTask = async (projectId, boardId, newTask) => {

        if (currentProject) {
            try {
                const updatedProject = {
                    ...currentProject,
                    boards: currentProject.boards.map(board =>
                        board.id === boardId
                            ? { ...board, tasks: [...(board.tasks || []), { ...newTask, id: uuid().toString(), createdAt: new Date().toLocaleString(), createdBy: currentUser.id }] }
                            : board
                    )
                };
                const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);
                setProjects(prevProjects => prevProjects.map(project =>
                    project.id === projectId ? response.data : project
                ));
                setCurrentProject(response.data);
            } catch (error) {
                console.error('Erreur lors de l\'ajout de la tâche:', error);
            }
        }
    };

    const handleEditTask = async (boardId, taskId, updatedTask) => {
        if (currentProject) {
            try {
                const updatedProject = {
                    ...currentProject,
                    boards: currentProject.boards.map(board =>
                        board.id === boardId
                            ? {
                                ...board,
                                tasks: board.tasks.map(task =>
                                    task.id === taskId ? { ...task, ...updatedTask } : task
                                )
                            }
                            : board
                    )
                };
                const response = await axios.put(`${API_BASE_URL}/projects/${currentProject.id}`, updatedProject);
                setProjects(prevProjects => prevProjects.map(project =>
                    project.id === currentProject.id ? response.data : project
                ));
                setCurrentProject(response.data);
            } catch (error) {
                console.error('Erreur lors de la mise à jour de la tâche:', error);
            }
        }
    };

    const handleSaveTask = async (projectId, boardId, updatedTask) => {
        if (currentProject && currentProject.id === projectId) {
            try {
                const updatedProject = {
                    ...currentProject,
                    boards: currentProject.boards.map(board =>
                        board.id === boardId
                            ? {
                                ...board,
                                tasks: board.tasks.map(task =>
                                    task.id === updatedTask.id
                                        ? updatedTask
                                        : task
                                )
                            }
                            : board
                    )
                };
                const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);

                setProjects(prevProjects => prevProjects.map(project =>
                    project.id === projectId ? response.data : project
                ));
                setCurrentProject(response.data);
                setEditingTask(updatedTask);

                console.log('Task updated successfully:', updatedTask);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde de la tâche:', error);
            }
        }
    };

    const handleUpdateBoardTitleColor = async (projectId, boardId, newColor) => {

        try {
            const project = projects.find(p => p.id === projectId);
            const updatedProject = {
                ...project,
                boards: project.boards.map(b => b.id === boardId ? { ...b, titleColor: newColor } : b)
            };
            const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);

            setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? response.data : p));
            setCurrentProject(response.data);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la couleur du tableau:', error);

        }
    };

    const handleDeleteTask = async (projectId, boardId, taskId) => {
        if (currentProject && currentProject.id === projectId) {
            try {
                const updatedProject = {
                    ...currentProject,
                    boards: currentProject.boards.map(board =>
                        board.id === boardId
                            ? { ...board, tasks: board.tasks.filter(task => task.id !== taskId) }
                            : board
                    )
                };
                const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);
                setProjects(prevProjects => prevProjects.map(project =>
                    project.id === projectId ? response.data : project
                ));
                setCurrentProject(response.data);
            } catch (error) {
                console.error('Erreur lors de la suppression de la tâche:', error);
            }
        }
    };

    const handleAddResponse = async (taskId, responseText, files) => {
        if (responseText && responseText.text.trim() !== "" && currentUser) {
            const sanitizedHtml = DOMPurify.sanitize(responseText.text);
            let uploadedFiles = [];
            if (files && files.length > 0) {
                try {
                    uploadedFiles = await handleUploadFiles(
                        files,
                        currentUser,
                        currentProject,
                        editingTask.boardId,
                        taskId
                    );
                } catch (error) {
                    console.error("Erreur lors de l'upload des fichiers:", error);
                }
            }
            const newResponse = {
                id: uuid().toString(),
                text: sanitizedHtml,
                date: new Date().toLocaleString(),
                author_id: currentUser.id,
                files: uploadedFiles,
            };

            try {
                const updatedTask = {
                    ...editingTask,
                    responses: [...(editingTask.responses || []), newResponse]
                };
                await handleSaveTask(currentProject.id, editingTask.boardId, updatedTask);
            } catch (error) {
                console.error('Erreur lors de l\'ajout de la réponse:', error);
            }
        }
    };

    const handleOpenTaskDetails = (task, boardId) => {
        setEditingTask({ ...task, boardId });
    };

    const handleCloseTaskDetails = () => {
        setEditingTask(null);
    };

    const handleMoveTask = async (projectId, sourceBoardId, destBoardId, sourceIndex, destIndex) => {
        if (currentProject && currentProject.id === projectId) {
            const updatedProject = { ...currentProject };
            const sourceBoard = updatedProject.boards.find(b => b.id.toString() === sourceBoardId);
            const destBoard = updatedProject.boards.find(b => b.id.toString() === destBoardId);

            if (!sourceBoard || !destBoard) return;

            const [movedTask] = sourceBoard.tasks.splice(sourceIndex, 1);
            destBoard.tasks.splice(destIndex, 0, movedTask);

            try {
                const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);
                setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? response.data : p));
                setCurrentProject(response.data);
            } catch (error) {
                console.error('Erreur lors du déplacement de la tâche:', error);
            }
        }
    };

    const handleEditResponse = async (taskId, responseId, updatedResponse) => {
        if (!currentProject) {
            console.error('Aucun projet courant');
            return;
        }

        try {
            const updatedProject = JSON.parse(JSON.stringify(currentProject));
            let taskFound = false;
            let uploadedFiles = updatedResponse.files || [];

            updatedProject.boards.forEach(board => {
                board.tasks.forEach(task => {
                    if (task.id === taskId) {
                        task.responses = task.responses.map(response =>
                            response.id === responseId
                                ? { ...response, ...updatedResponse }
                                : response
                        );
                        taskFound = true;
                    }
                });
            });

            if (!taskFound) {
                console.error('Task not found:', taskId);
                return;
            }

            const response = await axios.put(`${API_BASE_URL}/projects/${updatedProject.id}`, updatedProject);
            setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? response.data : p));
            setCurrentProject(response.data);

            setEditingTask(prevTask => ({
                ...prevTask,
                responses: prevTask.responses.map(response =>
                    response.id === responseId
                        ? { ...response, ...updatedResponse }
                        : response
                )
            }));

            console.log('Réponse modifiée avec succès');
        } catch (error) {
            console.error('Erreur lors de la modification de la réponse:', error);
        }
    };

    const handleUploadFiles = useCallback(async ({ files, currentUser, currentProject, boardId, taskId }) => {
        console.log('Début de l\'upload avec:', { files, currentUser, currentProject, boardId, taskId });

        if (!files || files.length === 0) {
            console.log('Aucun fichier à uploader');
            return [];
        }

        if (!currentUser || !currentProject || !boardId || !taskId) {
            console.error('Informations manquantes pour l\'upload', { currentUser, currentProject, boardId, taskId });
            return [];
        }

        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('files', file));
            formData.append('userId', currentUser.id);
            formData.append('projectId', currentProject.id);
            formData.append('boardId', boardId);
            formData.append('taskId', taskId);

            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('Réponse du serveur:', response.data);

            // La réponse du serveur devrait maintenant contenir toutes les informations nécessaires
            return response.data;
        } catch (error) {
            console.error("Erreur lors de l'upload des fichiers:", error);
            return [];
        }
    }, []);

    const handleDeleteResponse = async (taskId, responseId) => {
        if (currentProject) {
            try {
                const updatedProject = JSON.parse(JSON.stringify(currentProject)); // Copie profonde
                let taskFound = false;
                updatedProject.boards.forEach(board => {
                    board.tasks.forEach(task => {
                        if (task.id === taskId) {
                            task.responses = task.responses.filter(response => response.id !== responseId);
                            taskFound = true;
                        }
                    });
                });

                if (!taskFound) {
                    console.error('Task not found:', taskId);
                    return;
                }

                const response = await axios.put(`${API_BASE_URL}/projects/${updatedProject.id}`, updatedProject);
                setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? response.data : p));
                setCurrentProject(response.data);

                // Mise à jour de l'état local de la tâche en cours d'édition
                setEditingTask(prevTask => ({
                    ...prevTask,
                    responses: prevTask.responses.filter(response => response.id !== responseId)
                }));
            } catch (error) {
                console.error('Erreur lors de la suppression de la réponse:', error);
            }
        }
    };

    const handleInviteUser = async (projectId, userId) => {
        try {
            const updatedProject = {
                ...currentProject,
                guestUsers: [...(currentProject.guestUsers || []), userId]
            };
            const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);
            setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? response.data : p));
            setCurrentProject(response.data);
            console.log(`Utilisateur ${userId} ajouté au projet ${projectId}`);
        } catch (error) {
            console.error('Erreur lors de l\'invitation de l\'utilisateur:', error);
        }
    };

    const handleRevokeUser = async (projectId, userId) => {
        try {
            const updatedProject = {
                ...currentProject,
                guestUsers: currentProject.guestUsers.filter(id => id !== userId)
            };
            const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, updatedProject);
            setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? response.data : p));
            setCurrentProject(response.data);
            console.log(`Utilisateur ${userId} retiré du projet ${projectId}`);
        } catch (error) {
            console.error('Erreur lors de la révocation de l\'utilisateur:', error);
        }
    };

    return {
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
        handleUpdateProjectTitle,
        handleDeleteProject,
        handleAddTask,
        handleEditTask,
        handleDeleteTask,
        handleOpenTaskDetails,
        handleCloseTaskDetails,
        setEditingTask,
        handleAddBoard,
        handleUpdateBoardTitle,
        handleUpdateBoardTitleColor,
        handleDeleteBoard,
        handleMoveTask,
        handleSaveTask,
        handleAddResponse,
        handleEditResponse,
        handleDeleteResponse,
        handleUploadFiles,
        setCurrentProject,
        currentUser,
        users,
        handleInviteUser,
        handleRevokeUser,
        isLoading,
    };
}

export default useProjects;