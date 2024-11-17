// src/config/constants.js
export const STATUS_OPTIONS = [
    { value: "idle", label: "À faire", color: "#3e86aa" },
    { value: "processing", label: "En cours", color: "#535aaa" },
    { value: "testing", label: "A tester", color: "#9e9a60" },
    { value: "completed", label: "Terminée", color: "#588967" },
    { value: "blocked", label: "Bloquée", color: "#864f35" }
];

export const PRIORITY_OPTIONS = [
    { value: "low", label: "Basse", color: "#5e5887" },
    { value: "medium", label: "Moyenne", color: "#50448a" },
    { value: "high", label: "Élevée", color: "#4b3486" },
    { value: "urgent", label: "⚠️ Urgente", color: "#5e34a6" }
];

export const FILE_UPLOAD_CONFIG = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword']
};

export const API_ENDPOINTS = {
    baseUrl: import.meta.env.VITE_API_URL,
    auth: {
        signIn: '/signin',
        signUp: '/signup',
        signOut: '/signout'
    },
    projects: {
        base: '/projects',
        invite: '/projects/invite',
        revoke: '/projects/revoke'
    },
    tasks: {
        base: '/tasks',
        assign: '/tasks/assign',
        mention: '/tasks/mention'
    },
    notifications: {
        base: '/notifications',
        markSeen: '/notifications/seen'
    }
};