import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(async (config) => {
    try {
        // Récupérer le token depuis le localStorage ou autre stockage
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 Request Config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    } catch (error) {
        console.error('Error in request interceptor:', error);
        return Promise.reject(error);
    }
});

// Intercepteur pour logger les réponses et gérer les erreurs
api.interceptors.response.use(
    (response) => {
        console.log('📥 Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        return response;
    },
    (error) => {
        console.error('🚫 API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return Promise.reject(error);
    }
);

export default api;