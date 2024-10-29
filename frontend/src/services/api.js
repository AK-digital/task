import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(request => {
    console.log('Starting Request', request)
    return request
})

// Vous pouvez ajouter des intercepteurs ici si nécessaire
api.interceptors.response.use(
    response => response,
    error => {
        console.error("Erreur API:", error);
        return Promise.reject(error);
    }
);


export default api;