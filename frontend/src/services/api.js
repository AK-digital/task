import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Cela correspondra à la configuration de votre proxy Vite
});

// Vous pouvez ajouter des intercepteurs ici si nécessaire
api.interceptors.response.use(
    response => response,
    error => {
        console.error("Erreur API:", error);
        return Promise.reject(error);
    }
);

export default api;