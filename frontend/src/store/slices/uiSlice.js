import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: 'light',
    isNotificationsPanelOpen: false,
    isInviteDialogOpen: false,
    isSidebarOpen: true,
    isLoading: false,
    loadingText: 'Chargement...',
    error: null,
    toasts: [],
    modals: {
        current: null,
        stack: [],
    },
    dropdownMenus: {
        userMenu: false,
        projectMenu: false
    }
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        setNotificationsPanelOpen: (state, action) => {
            state.isNotificationsPanelOpen = action.payload;
            // Ferme les autres menus si on ouvre les notifications
            if (action.payload) {
                state.dropdownMenus.userMenu = false;
                state.dropdownMenus.projectMenu = false;
            }
        },
        setInviteDialogOpen: (state, action) => {
            state.isInviteDialogOpen = action.payload;
        },
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
            localStorage.setItem('sidebarOpen', state.isSidebarOpen.toString());
        },
        setLoading: (state, action) => {
            if (typeof action.payload === 'object') {
                state.isLoading = action.payload.status;
                state.loadingText = action.payload.text || 'Chargement...';
            } else {
                state.isLoading = action.payload;
                state.loadingText = 'Chargement...';
            }
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        addToast: (state, action) => {
            const newToast = {
                id: Date.now(),
                duration: 5000,
                ...action.payload
            };
            state.toasts.push(newToast);
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },
        clearToasts: (state) => {
            state.toasts = [];
        },
        openModal: (state, action) => {
            const { type, props } = action.payload;
            state.modals.current = { type, props };
            state.modals.stack.push({ type, props });
        },
        closeModal: (state) => {
            state.modals.stack.pop();
            state.modals.current = state.modals.stack[state.modals.stack.length - 1] || null;
        },
        closeAllModals: (state) => {
            state.modals.current = null;
            state.modals.stack = [];
        },
        toggleDropdownMenu: (state, action) => {
            const menuName = action.payload;
            // Ferme les autres menus
            Object.keys(state.dropdownMenus).forEach(key => {
                if (key !== menuName) {
                    state.dropdownMenus[key] = false;
                }
            });
            state.dropdownMenus[menuName] = !state.dropdownMenus[menuName];
            state.isNotificationsPanelOpen = false;
        },
        closeAllDropdownMenus: (state) => {
            Object.keys(state.dropdownMenus).forEach(key => {
                state.dropdownMenus[key] = false;
            });
            state.isNotificationsPanelOpen = false;
        }
    }
});

export const {
    setTheme,
    setNotificationsPanelOpen,
    setInviteDialogOpen,
    toggleSidebar,
    setLoading,
    setError,
    clearError,
    addToast,
    removeToast,
    clearToasts,
    openModal,
    closeModal,
    closeAllModals,
    toggleDropdownMenu,
    closeAllDropdownMenus
} = uiSlice.actions;

// Sélecteurs
export const selectTheme = state => state.ui.theme;
export const selectIsNotificationsPanelOpen = state => state.ui.isNotificationsPanelOpen;
export const selectIsInviteDialogOpen = state => state.ui.isInviteDialogOpen;
export const selectIsSidebarOpen = state => state.ui.isSidebarOpen;
export const selectIsLoading = state => state.ui.isLoading;
export const selectLoadingText = state => state.ui.loadingText;
export const selectError = state => state.ui.error;
export const selectToasts = state => state.ui.toasts;
export const selectCurrentModal = state => state.ui.modals.current;
export const selectDropdownMenus = state => state.ui.dropdownMenus;

export default uiSlice.reducer;