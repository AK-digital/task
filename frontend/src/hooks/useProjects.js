import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';

const API_BASE_URL = 'http://localhost:5000/api';

function useProjects() {
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const fetchProjects = useCallback(async () => {
        if (!currentUser) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/projects?userId=${currentUser.id}`);
            const fetchedProjects = response.data;
            setProjects(fetchedProjects);
            if (fetchedProjects.length > 0) {
                setCurrentProject(fetchedProjects[0]);
            } else {
                setCurrentProject(null);
            }
            console.log("Projects fetched:", fetchedProjects);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            setProjects([]);
            setCurrentProject(null);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchProjects();
        }
    }, [currentUser, fetchProjects]);

    useEffect(() => {
        fetchUsers();
        fetchCurrentUser();
    }, []);

    /**
     * USERS FUNCTIONS
     */

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
    };

    const fetchCurrentUser = async () => {
        const token = Cookies.get("authToken");
        if (token) {
            try {
                const response = await axios.get(`${API_BASE_URL}/users`);
                const user = response.data.find(u => u.authToken === token);
                if (user) {
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur courant: ', error);
            }
        }
    };

    /**
     * PROJECTS FUNCTIONS
        */

    const handleProjectChange = (e) => {
        const projectId = e.target.value;
        const selectedProject = projects.find(p => p.id.toString() === projectId);
        setCurrentProject(selectedProject);
    };

    const handleCreateProjectClick = () => {
        setIsCreatingProject(true);
    };

    const handleCreateProject = async () => {
        if (newProjectName.trim() && currentUser) {
            try {
                const newProject = {
                    name: newProjectName.trim(),
                    boards: [
                        {
                            id: Date.now(),
                            title: "Tableau par défaut",
                            tasks: []
                        }
                    ],
                    userId: currentUser.id
                };
                const response = await axios.post(`${API_BASE_URL}/projects`, newProject);
                setProjects(prevProjects => [...prevProjects, response.data]);
                setCurrentProject(response.data);
                setNewProjectName('');
                setIsCreatingProject(false);
            } catch (error) {
                console.error('Erreur lors de la création du projet:', error);
            }
        }
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

                // Si le projet supprimé était le projet courant
                if (currentProject && currentProject.id === projectId) {
                    // Trouver l'index du projet supprimé
                    const deletedIndex = prevProjects.findIndex(p => p.id === projectId);

                    // Sélectionner le prochain projet, ou le précédent s'il n'y a pas de suivant, ou null s'il n'y a plus de projets
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
                id: Date.now(),
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
                            ? { ...board, tasks: [...(board.tasks || []), { ...newTask, id: Date.now() }] }
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
        console.log(taskId);
        console.log(responseText);
        console.log(currentProject);
        console.log(editingTask.boardId);
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
                id: Date.now(),
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

    const handleEditResponse = async (taskId, responseId, newText, files) => {
        if (currentProject) {
            try {
                let uploadedFiles = [];
                if (files && files.length > 0) {
                    const board = currentProject.boards.find(board =>
                        board.tasks.some(task => task.id === taskId)
                    );
                    if (!board) {
                        throw new Error('Board not found for the task');
                    }

                    uploadedFiles = await handleUploadFiles(files, currentUser, currentProject, board.id, taskId);
                }

                const updatedProject = JSON.parse(JSON.stringify(currentProject));
                let taskFound = false;
                updatedProject.boards.forEach(board => {
                    board.tasks.forEach(task => {
                        if (task.id === taskId) {
                            task.responses = task.responses.map(response =>
                                response.id === responseId
                                    ? { ...response, text: newText, files: [...(response.files || []), ...uploadedFiles] }
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
                            ? { ...response, text: newText, files: [...(response.files || []), ...uploadedFiles] }
                            : response
                    )
                }));
            } catch (error) {
                console.error('Erreur lors de la modification de la réponse:', error);
            }
        }
    };

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

    const handleUploadFiles = async (files, currentUser, currentProject, boardId, taskId) => {
        console.log("handleUploadFiles called with:", { files, currentUser, currentProject, boardId, taskId });
        try {
            if (!currentUser) throw new Error('User is undefined');
            if (!currentProject || !currentProject.id) throw new Error('Project or Project ID is undefined');
            if (!boardId) throw new Error('Board ID is undefined');
            if (!taskId) throw new Error('Task ID is undefined');

            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            formData.append('userId', currentUser.id);
            formData.append('projectId', currentProject.id);
            formData.append('boardId', boardId);
            formData.append('taskId', taskId);

            const response = await axios.post(`http://localhost:5000/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Fichiers uploadés:", response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'upload des fichiers:', error);
            throw error;
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
        handleDeleteBoard,
        handleMoveTask,
        handleSaveTask,
        handleAddResponse,
        handleEditResponse,
        handleDeleteResponse,
        handleUploadFiles,
        currentUser,
        users,
    };
}

export default useProjects;