import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { db } from '../../config/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

// État initial
const initialState = {
    items: [],
    currentProject: null,
    isCreatingProject: false,
    isInviteDialogOpen: false,
    isLoading: false,
    error: null,
    users: []
};

// Thunks
export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async (userId, { rejectWithValue }) => {
        try {
            const projectsRef = collection(db, 'projects');
            const q = query(projectsRef,
                where('userId', '==', userId),
                where('guestUsers', 'array-contains', userId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createProject = createAsyncThunk(
    'projects/createProject',
    async ({ name, userId }, { rejectWithValue }) => {
        try {
            const projectRef = doc(collection(db, 'projects'));
            const newProject = {
                id: projectRef.id,
                name: name.trim(),
                userId,
                guestUsers: [],
                boards: [
                    {
                        id: uuid(),
                        title: "À faire",
                        tasks: [],
                        titleColor: "#3e86aa"
                    },
                    {
                        id: uuid(),
                        title: "En cours",
                        tasks: [],
                        titleColor: "#535aaa"
                    },
                    {
                        id: uuid(),
                        title: "Terminé",
                        tasks: [],
                        titleColor: "#588967"
                    }
                ],
                createdAt: new Date().toISOString()
            };
            await setDoc(projectRef, newProject);
            return newProject;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProject = createAsyncThunk(
    'projects/updateProject',
    async ({ projectId, updates }, { rejectWithValue }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, updates);
            return { projectId, updates };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async (projectId, { rejectWithValue }) => {
        try {
            await deleteDoc(doc(db, 'projects', projectId));
            return projectId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const moveTask = createAsyncThunk(
    'projects/moveTask',
    async ({ projectId, sourceBoardId, destBoardId, sourceIndex, destIndex }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const updatedBoards = [...currentProject.boards];
            const sourceBoard = updatedBoards.find(b => b.id === sourceBoardId);
            const destBoard = updatedBoards.find(b => b.id === destBoardId);

            if (!sourceBoard || !destBoard) throw new Error('Board not found');

            // Copie et mise à jour du task
            const [movedTask] = sourceBoard.tasks.splice(sourceIndex, 1);
            destBoard.tasks.splice(destIndex, 0, {
                ...movedTask,
                updatedAt: new Date().toISOString()
            });

            await updateDoc(projectRef, { boards: updatedBoards });
            return { projectId, updatedBoards };
        } catch (error) {
            throw error;
        }
    }
);

export const updateBoard = createAsyncThunk(
    'projects/updateBoard',
    async ({ projectId, boardId, updateData }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const updatedBoards = currentProject.boards.map(board =>
                board.id === boardId ? { ...board, ...updateData } : board
            );

            await updateDoc(projectRef, { boards: updatedBoards });
            return { projectId, boardId, updateData };
        } catch (error) {
            throw error;
        }
    }
);

export const deleteBoard = createAsyncThunk(
    'projects/deleteBoard',
    async ({ projectId, boardId }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const updatedBoards = currentProject.boards.filter(board =>
                board.id !== boardId
            );

            await updateDoc(projectRef, { boards: updatedBoards });
            return { projectId, boardId };
        } catch (error) {
            throw error;
        }
    }
);

export const addBoard = createAsyncThunk(
    'projects/addBoard',
    async ({ projectId, title }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const newBoard = {
                id: uuid(),
                title,
                tasks: [],
                titleColor: "#ffffff",
                createdAt: new Date().toISOString()
            };

            const updatedBoards = [...currentProject.boards, newBoard];
            await updateDoc(projectRef, { boards: updatedBoards });

            return { projectId, newBoard };
        } catch (error) {
            throw error;
        }
    }
);

export const addTask = createAsyncThunk(
    'projects/addTask',
    async ({ projectId, boardId, taskData }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const newTask = {
                ...taskData,
                id: uuid(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const updatedBoards = currentProject.boards.map(board => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        tasks: [...board.tasks, newTask]
                    };
                }
                return board;
            });

            await updateDoc(projectRef, { boards: updatedBoards });
            return { projectId, boardId, task: newTask };
        } catch (error) {
            throw error;
        }
    }
);

export const inviteUser = createAsyncThunk(
    'projects/inviteUser',
    async ({ projectId, userId }, { getState, rejectWithValue }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                guestUsers: arrayUnion(userId)
            });

            // Créer une notification pour l'utilisateur invité
            const notificationRef = doc(collection(db, 'notifications'));
            const currentProject = getState().projects.currentProject;
            const currentUser = getState().auth.currentUser;

            await setDoc(notificationRef, {
                id: notificationRef.id,
                userId: userId,
                type: 'project_invitation',
                title: "Invitation au projet",
                description: `${currentUser.name} vous a invité au projet "${currentProject.name}"`,
                projectId: currentProject.id,
                date: new Date().toISOString(),
                seen: false
            });

            return { projectId, userId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const revokeUser = createAsyncThunk(
    'projects/revokeUser',
    async ({ projectId, userId }, { rejectWithValue }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                guestUsers: arrayRemove(userId)
            });
            return { projectId, userId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'projects/updateUserProfile',
    async ({ userId, updates }, { rejectWithValue }) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, updates);
            return { userId, updates };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        setIsCreatingProject: (state, action) => {
            state.isCreatingProject = action.payload;
        },
        setInviteDialogOpen: (state, action) => {
            state.isInviteDialogOpen = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        clearProjects: (state) => {
            state.items = [];
            state.currentProject = null;
            state.isCreatingProject = false;
            state.isInviteDialogOpen = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Projects
            .addCase(fetchProjects.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.items = action.payload;
                state.isLoading = false;
                if (!state.currentProject && action.payload.length > 0) {
                    state.currentProject = action.payload[0];
                }
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Create Project
            .addCase(createProject.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.currentProject = action.payload;
                state.isCreatingProject = false;
            })

            // Update Project
            .addCase(updateProject.fulfilled, (state, action) => {
                const { projectId, updates } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    Object.assign(project, updates);
                    if (state.currentProject?.id === projectId) {
                        Object.assign(state.currentProject, updates);
                    }
                }
            })

            // Delete Project
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.items = state.items.filter(project => project.id !== action.payload);
                if (state.currentProject?.id === action.payload) {
                    state.currentProject = state.items[0] || null;
                }
            })

            // Move Task
            .addCase(moveTask.fulfilled, (state, action) => {
                const { projectId, updatedBoards } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    project.boards = updatedBoards;
                    if (state.currentProject?.id === projectId) {
                        state.currentProject.boards = updatedBoards;
                    }
                }
            })

            // Update Board
            .addCase(updateBoard.fulfilled, (state, action) => {
                const { projectId, boardId, updateData } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    const board = project.boards.find(b => b.id === boardId);
                    if (board) {
                        Object.assign(board, updateData);
                        if (state.currentProject?.id === projectId) {
                            const currentBoard = state.currentProject.boards.find(
                                b => b.id === boardId
                            );
                            if (currentBoard) {
                                Object.assign(currentBoard, updateData);
                            }
                        }
                    }
                }
            })

            // Delete Board
            .addCase(deleteBoard.fulfilled, (state, action) => {
                const { projectId, boardId } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    project.boards = project.boards.filter(b => b.id !== boardId);
                    if (state.currentProject?.id === projectId) {
                        state.currentProject.boards = state.currentProject.boards.filter(
                            b => b.id !== boardId
                        );
                    }
                }
            })

            // Add Board
            .addCase(addBoard.fulfilled, (state, action) => {
                const { projectId, newBoard } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    project.boards.push(newBoard);
                    if (state.currentProject?.id === projectId) {
                        state.currentProject.boards.push(newBoard);
                    }
                }
            })

            // Add Task
            .addCase(addTask.fulfilled, (state, action) => {
                const { projectId, boardId, task } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    const board = project.boards.find(b => b.id === boardId);
                    if (board) {
                        board.tasks.push(task);
                        if (state.currentProject?.id === projectId) {
                            const currentBoard = state.currentProject.boards.find(
                                b => b.id === boardId
                            );
                            if (currentBoard) {
                                currentBoard.tasks.push(task);
                            }
                        }
                    }
                }
            })

            // Invite User
            .addCase(inviteUser.fulfilled, (state, action) => {
                const { projectId, userId } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    project.guestUsers.push(userId);
                    if (state.currentProject?.id === projectId) {
                        state.currentProject.guestUsers.push(userId);
                    }
                }
            })

            // Revoke User
            .addCase(revokeUser.fulfilled, (state, action) => {
                const { projectId, userId } = action.payload;
                const project = state.items.find(p => p.id === projectId);
                if (project) {
                    project.guestUsers = project.guestUsers.filter(id => id !== userId);
                    if (state.currentProject?.id === projectId) {
                        state.currentProject.guestUsers = state.currentProject.guestUsers.filter(
                            id => id !== userId
                        );
                    }
                }
            })

            // Update User Profile
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                const { userId, updates } = action.payload;
                const user = state.users.find(u => u.id === userId);
                if (user) {
                    Object.assign(user, updates);
                }
            });
    }
});

// Actions
export const {
    setCurrentProject,
    setIsCreatingProject,
    setInviteDialogOpen,
    setUsers,
    clearProjects
} = projectSlice.actions;

// Sélecteurs
export const selectProjects = state => state.projects.items;
export const selectCurrentProject = state => state.projects.currentProject;
export const selectIsLoading = state => state.projects.isLoading;
export const selectError = state => state.projects.error;
export const selectIsInviteDialogOpen = state => state.projects.isInviteDialogOpen;
export const selectIsCreatingProject = state => state.projects.isCreatingProject;
export const selectProjectUsers = state => state.projects.users;

export default projectSlice.reducer;