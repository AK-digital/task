import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { tasksApi } from '../../services/api/tasks';

const initialState = {
    currentTask: null,
    loading: false,
    error: null,
    taskDetailsOpen: false
};

export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ projectId, boardId, taskId, updates }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const updatedBoards = currentProject.boards.map(board => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        tasks: board.tasks.map(task => {
                            if (task.id === taskId) {
                                return {
                                    ...task,
                                    ...updates,
                                    updatedAt: new Date().toISOString()
                                };
                            }
                            return task;
                        })
                    };
                }
                return board;
            });

            await updateDoc(projectRef, { boards: updatedBoards });
            return { projectId, boardId, taskId, updates };
        } catch (error) {
            throw error;
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async ({ projectId, boardId, taskId }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const updatedBoards = currentProject.boards.map(board => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        tasks: board.tasks.filter(task => task.id !== taskId)
                    };
                }
                return board;
            });

            await updateDoc(projectRef, { boards: updatedBoards });
            return { projectId, boardId, taskId };
        } catch (error) {
            throw error;
        }
    }
);

export const addTaskResponse = createAsyncThunk(
    'tasks/addTaskResponse',
    async ({ projectId, boardId, taskId, response }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;
            const currentUser = getState().auth.currentUser;

            const responseWithId = {
                ...response,
                id: uuid(),
                createdAt: new Date().toISOString(),
                author: {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.profilePicture
                }
            };

            const updatedBoards = currentProject.boards.map(board => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        tasks: board.tasks.map(task => {
                            if (task.id === taskId) {
                                const responses = task.responses || [];
                                return {
                                    ...task,
                                    responses: [...responses, responseWithId],
                                    updatedAt: new Date().toISOString()
                                };
                            }
                            return task;
                        })
                    };
                }
                return board;
            });

            await updateDoc(projectRef, { boards: updatedBoards });

            // Notifier les utilisateurs mentionnés
            if (response.mentionedUsers?.length > 0) {
                const task = currentProject.boards
                    .find(b => b.id === boardId)
                    ?.tasks.find(t => t.id === taskId);

                await tasksApi.notifyMention(
                    response.mentionedUsers,
                    {
                        taskId,
                        taskTitle: task.title,
                        responseText: response.text,
                        authorName: currentUser.name
                    },
                    'response'
                );
            }

            return { projectId, boardId, taskId, response: responseWithId };
        } catch (error) {
            throw error;
        }
    }
);

export const deleteTaskResponse = createAsyncThunk(
    'tasks/deleteTaskResponse',
    async ({ projectId, boardId, taskId, responseId }, { getState }) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const currentProject = getState().projects.currentProject;

            const updatedBoards = currentProject.boards.map(board => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        tasks: board.tasks.map(task => {
                            if (task.id === taskId) {
                                return {
                                    ...task,
                                    responses: task.responses.filter(r => r.id !== responseId),
                                    updatedAt: new Date().toISOString()
                                };
                            }
                            return task;
                        })
                    };
                }
                return board;
            });

            await updateDoc(projectRef, { boards: updatedBoards });
            return { projectId, boardId, taskId, responseId };
        } catch (error) {
            throw error;
        }
    }
);

export const assignTask = createAsyncThunk(
    'tasks/assignTask',
    async ({ projectId, boardId, taskId, userId }, { getState }) => {
        try {
            const currentUser = getState().auth.currentUser;
            const updates = {
                assignedTo: userId,
                assignedBy: currentUser.id,
                assignedAt: new Date().toISOString()
            };

            await updateTask({ projectId, boardId, taskId, updates });

            // Notifier l'utilisateur assigné
            const task = getState().projects.currentProject.boards
                .find(b => b.id === boardId)
                ?.tasks.find(t => t.id === taskId);

            if (task) {
                const assignedUser = getState().projects.users.find(u => u.id === userId);
                if (assignedUser?.email) {
                    await tasksApi.notifyTaskAssignment(
                        assignedUser.email,
                        {
                            taskId,
                            taskTitle: task.title,
                            assignedBy: currentUser.name
                        }
                    );
                }
            }

            return { projectId, boardId, taskId, updates };
        } catch (error) {
            throw error;
        }
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setCurrentTask: (state, action) => {
            state.currentTask = action.payload;
            state.taskDetailsOpen = true;
        },
        clearCurrentTask: (state) => {
            state.currentTask = null;
            state.taskDetailsOpen = false;
        },
        toggleTaskDetails: (state) => {
            state.taskDetailsOpen = !state.taskDetailsOpen;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateTask.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentTask?.id === action.payload.taskId) {
                    state.currentTask = {
                        ...state.currentTask,
                        ...action.payload.updates
                    };
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(deleteTask.fulfilled, (state, action) => {
                if (state.currentTask?.id === action.payload.taskId) {
                    state.currentTask = null;
                    state.taskDetailsOpen = false;
                }
            })

            .addCase(addTaskResponse.fulfilled, (state, action) => {
                if (state.currentTask?.id === action.payload.taskId) {
                    const responses = state.currentTask.responses || [];
                    state.currentTask.responses = [...responses, action.payload.response];
                }
            })

            .addCase(deleteTaskResponse.fulfilled, (state, action) => {
                if (state.currentTask?.id === action.payload.taskId) {
                    state.currentTask.responses = state.currentTask.responses.filter(
                        response => response.id !== action.payload.responseId
                    );
                }
            })

            .addCase(assignTask.fulfilled, (state, action) => {
                if (state.currentTask?.id === action.payload.taskId) {
                    state.currentTask = {
                        ...state.currentTask,
                        ...action.payload.updates
                    };
                }
            });
    }
});

export const {
    setCurrentTask,
    clearCurrentTask,
    toggleTaskDetails
} = taskSlice.actions;

// Sélecteurs
export const selectCurrentTask = state => state.tasks.currentTask;
export const selectTaskLoading = state => state.tasks.loading;
export const selectTaskError = state => state.tasks.error;
export const selectTaskDetailsOpen = state => state.tasks.taskDetailsOpen;

export default taskSlice.reducer;