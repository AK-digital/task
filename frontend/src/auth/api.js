import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteurs pour le logging
api.interceptors.request.use(request => {
    console.log('Starting Request', request);
    return request;
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error("Erreur API:", error);
        return Promise.reject(error);
    }
);