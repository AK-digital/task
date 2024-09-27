import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useProjects() {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const api = axios.create({
        baseURL: API_BASE_URL,
    });

    const fetchProjects = useCallback(async () => {
        if (!currentUser) return;

        try {
            const { data: allProjects } = await api.get('/projects');
            const ownedProjects = allProjects.filter(project => project.userId === currentUser.id);
            const invitedProjects = allProjects.filter(project =>
                project.guestUsers && project.guestUsers.includes(currentUser.id)
            );
            const combinedProjects = [...ownedProjects, ...invitedProjects];

            setProjects(combinedProjects);

            if (currentUser.currentProjectId) {
                const currentProject = combinedProjects.find(project => project.id === currentUser.currentProjectId);
                setCurrentProject(currentProject || combinedProjects[0]);
            } else if (combinedProjects.length > 0) {
                setCurrentProject(combinedProjects[0]);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            if (currentUser) {
                await fetchProjects();
                await fetchUsers();
            }
            setIsLoading(false);
        };

        initializeData();
    }, [currentUser, fetchProjects]);

    const handleProjectChange = async (e) => {
        const projectId = e.target.value;
        const selectedProject = projects.find(p => p.id === projectId);
        setCurrentProject(selectedProject);

        if (currentUser) {
            try {
                await api.patch(`/users/${currentUser.id}`, { currentProjectId: projectId });
            } catch (error) {
                console.error('Erreur lors de la mise à jour du projet actuel:', error);
            }
        }
    };

    const handleCreateProject = async () => {
        if (newProjectName.trim() && currentUser) {
            try {
                const newProject = {
                    id: uuid(),
                    name: newProjectName.trim(),
                    boards: [{ id: uuid(), title: "Tableau par défaut", tasks: [] }],
                    userId: currentUser.id,
                };
                const { data } = await api.post('/projects', newProject);
                setProjects(prev => [...prev, data]);
                setCurrentProject(data);
                setNewProjectName('');
                setIsCreatingProject(false);
            } catch (error) {
                console.error('Erreur lors de la création du projet:', error);
            }
        }
    };

    const handleUpdateProjectTitle = async (projectId, newTitle) => {
        if (currentProject && currentProject.id === projectId) {
            try {
                const updatedProject = { ...currentProject, name: newTitle };
                const { data } = await api.put(`/projects/${projectId}`, updatedProject);
                setProjects(prev => prev.map(project => project.id === projectId ? data : project));
                setCurrentProject(data);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du titre du projet:', error);
            }
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            await api.delete(`/projects/${projectId}`);
            setProjects(prev => {
                const updatedProjects = prev.filter(project => project.id !== projectId);
                if (currentProject && currentProject.id === projectId) {
                    setCurrentProject(updatedProjects[0] || null);
                }
                return updatedProjects;
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
        }
    };

    const handleAddBoard = async (projectId, title) => {
        try {
            const project = projects.find(p => p.id === projectId);
            const newBoard = { id: uuid(), title, tasks: [] };
            const updatedProject = { ...project, boards: [...project.boards, newBoard] };
            const { data } = await api.put(`/projects/${projectId}`, updatedProject);
            setProjects(prev => prev.map(p => p.id === projectId ? data : p));
            setCurrentProject(data);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du tableau:', error);
        }
    };

    const handleDeleteBoard = async (projectId, boardId) => {
        if (currentProject) {
            try {
                const updatedBoards = currentProject.boards.filter(board => board.id !== boardId);
                const updatedProject = { ...currentProject, boards: updatedBoards };
                const { data } = await api.put(`/projects/${projectId}`, updatedProject);
                setProjects(prev => prev.map(project => project.id === projectId ? data : project));
                setCurrentProject(data);
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
            const { data } = await api.put(`/projects/${projectId}`, updatedProject);
            setProjects(prev => prev.map(p => p.id === projectId ? data : p));
            setCurrentProject(data);
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
                            ? { ...board, tasks: [...(board.tasks || []), { ...newTask, id: uuid(), createdAt: new Date().toLocaleString(), createdBy: currentUser.id }] }
                            : board
                    )
                };
                const { data } = await api.put(`/projects/${projectId}`, updatedProject);
                setProjects(prev => prev.map(project => project.id === projectId ? data : project));
                setCurrentProject(data);
            } catch (error) {
                console.error('Erreur lors de l\'ajout de la tâche:', error);
            }
        }
    };

    const handleEditTask = async (projectId, boardId, taskId, updatedTask) => {
        console.log('handleEditTask called with:', { projectId, boardId, taskId, updatedTask });
        if (currentProject && currentProject.id === projectId) {
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
                const { data } = await api.put(`/projects/${projectId}`, updatedProject);
                setProjects(prev => prev.map(project => project.id === projectId ? data : project));
                setCurrentProject(data);
            } catch (error) {
                console.error('Erreur lors de la mise à jour de la tâche:', error);
            }
        } else {
            console.error('Project not found or mismatch:', projectId, currentProject?.id);
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
                const { data } = await api.put(`/projects/${projectId}`, updatedProject);
                setProjects(prev => prev.map(project => project.id === projectId ? data : project));
                setCurrentProject(data);
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
                    uploadedFiles = await handleUploadFiles({
                        files,
                        currentUser,
                        currentProject,
                        boardId: editingTask.boardId,
                        taskId
                    });
                } catch (error) {
                    console.error("Erreur lors de l'upload des fichiers:", error);
                }
            }
            const newResponse = {
                id: uuid(),
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
                                    task.id === updatedTask.id ? updatedTask : task
                                )
                            }
                            : board
                    )
                };
                const { data } = await api.put(`/projects/${projectId}`, updatedProject);
                setProjects(prev => prev.map(project => project.id === projectId ? data : project));
                setCurrentProject(data);
                setEditingTask(updatedTask);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde de la tâche:', error);
            }
        }
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
                const { data } = await api.put(`/projects/${projectId}`, updatedProject);
                setProjects(prev => prev.map(p => p.id === projectId ? data : p));
                setCurrentProject(data);
            } catch (error) {
                console.error('Erreur lors du déplacement de la tâche:', error);
            }
        }
    };

    const handleUploadFiles = useCallback(async ({ files, currentUser, currentProject, boardId, taskId }) => {
        if (!files || files.length === 0) {
            console.error('Aucun fichier à uploader');
            return [];
        }

        if (!currentUser || !currentProject || !boardId || !taskId) {
            console.error('Informations manquantes pour l\'upload');
            return [];
        }

        try {
            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append(`files`, file);
                console.log(`Ajout du fichier ${index + 1}:`, file.name);
            });

            formData.append('userId', currentUser.id);
            formData.append('projectId', currentProject.id);
            formData.append('boardId', boardId);
            formData.append('taskId', taskId);

            console.log('FormData envoyé:', Object.fromEntries(formData));

            console.log('Début de l\'upload...');
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Progression de l'upload: ${percentCompleted}%`);
                }
            });

            console.log('Réponse du serveur complète:', response);
            console.log('Données de la réponse:', response.data);

            if (response.status === 201 && Array.isArray(response.data)) {
                return response.data;
            } else {
                console.error('Réponse inattendue du serveur:', response.data);
                return [];
            }

        } catch (error) {
            console.error("Erreur lors de l'upload des fichiers:", error);
            console.error("Détails de l'erreur:", error.response ? error.response : error);
            return [];
        }
    }, [api]);

    const handleInviteUser = async (projectId, userId) => {
        try {
            const updatedProject = {
                ...currentProject,
                guestUsers: [...(currentProject.guestUsers || []), userId]
            };
            const { data } = await api.put(`/projects/${projectId}`, updatedProject);
            setProjects(prev => prev.map(p => p.id === projectId ? data : p));
            setCurrentProject(data);
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
            const { data } = await api.put(`/projects/${projectId}`, updatedProject);
            setProjects(prev => prev.map(p => p.id === projectId ? data : p));
            setCurrentProject(data);
        } catch (error) {
            console.error('Erreur lors de la révocation de l\'utilisateur:', error);
        }
    };

    const handleUpdateBoardTitleColor = async (projectId, boardId, newColor) => {
        try {
            const updatedProject = {
                ...currentProject,
                boards: currentProject.boards.map(b =>
                    b.id === boardId ? { ...b, titleColor: newColor } : b
                )
            };
            const { data } = await api.put(`/projects/${projectId}`, updatedProject);
            setProjects(prev => prev.map(p => p.id === projectId ? data : p));
            setCurrentProject(data);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la couleur du tableau:', error);
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

            updatedProject.boards.forEach(board => {
                board.tasks.forEach(task => {
                    if (task.id === taskId) {
                        task.responses = task.responses.map(response =>
                            response.id === responseId ? { ...response, ...updatedResponse } : response
                        );
                        taskFound = true;
                    }
                });
            });

            if (!taskFound) {
                console.error('Task not found:', taskId);
                return;
            }

            const { data } = await api.put(`/projects/${updatedProject.id}`, updatedProject);
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? data : p));
            setCurrentProject(data);

            setEditingTask(prevTask => ({
                ...prevTask,
                responses: prevTask.responses.map(response =>
                    response.id === responseId ? { ...response, ...updatedResponse } : response
                )
            }));

        } catch (error) {
            console.error('Erreur lors de la modification de la réponse:', error);
        }
    };

    const handleDeleteResponse = async (taskId, responseId) => {
        if (currentProject) {
            try {
                const updatedProject = JSON.parse(JSON.stringify(currentProject));
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

                const { data } = await api.put(`/projects/${updatedProject.id}`, updatedProject);
                setProjects(prev => prev.map(p => p.id === updatedProject.id ? data : p));
                setCurrentProject(data);

                setEditingTask(prevTask => ({
                    ...prevTask,
                    responses: prevTask.responses.filter(response => response.id !== responseId)
                }));
            } catch (error) {
                console.error('Erreur lors de la suppression de la réponse:', error);
            }
        }
    };

    const handleOpenTaskDetails = (task, boardId) => {
        setEditingTask({ ...task, boardId });
    };

    const handleCloseTaskDetails = () => {
        setEditingTask(null);
    };

    return {
        projects,
        currentProject,
        editingTask,
        users,
        isCreatingProject,
        newProjectName,
        isLoading,
        setNewProjectName,
        setCurrentProject,
        handleProjectChange,
        handleCreateProject,
        handleCreateProjectClick: () => setIsCreatingProject(true),
        handleCancelCreateProject: () => {
            setNewProjectName('');
            setIsCreatingProject(false);
        },
        handleUpdateProjectTitle,
        handleDeleteProject,
        handleAddTask,
        handleEditTask,
        handleDeleteTask,
        handleOpenTaskDetails,
        handleCloseTaskDetails,
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
        handleInviteUser,
        handleRevokeUser,
    };
}

export default useProjects;