import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectSlice';
import tasksReducer from './slices/taskSlice';
import notificationReducer from './slices/notificationSlice';
import fileReducer from './slices/fileSlice';
import uiReducer from './slices/uiSlice';
import filterReducer from './slices/filterSlice';
import errorMiddleware from './middleware/errorMiddleware';

const store = configureStore({
    reducer: {
        auth: authReducer,
        projects: projectsReducer,
        tasks: tasksReducer,
        notifications: notificationReducer,
        files: fileReducer,
        ui: uiReducer,
        filters: filterReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Actions à ignorer pour la vérification de sérialisation
                ignoredActions: [
                    'auth/signIn/fulfilled',
                    'auth/signInWithSSO/fulfilled',
                    'auth/setUser',
                    'projects/fetchProjects/fulfilled',
                    'projects/createProject/fulfilled',
                    'projects/inviteUser/fulfilled',
                    'projects/addBoard/fulfilled',
                    'tasks/addTask/fulfilled',
                    'tasks/updateTask/fulfilled',
                    'notifications/addNotification/fulfilled',
                    'files/upload/pending',
                    'files/upload/fulfilled'
                ],
                // Chemins d'état à ignorer pour la vérification de sérialisation
                ignoredPaths: [
                    'auth.currentUser',
                    'projects.currentProject',
                    'files.uploads',
                    'tasks.currentTask',
                    'notifications.items'
                ]
            },
            thunk: true
        }).concat(errorMiddleware)
});

export default store;