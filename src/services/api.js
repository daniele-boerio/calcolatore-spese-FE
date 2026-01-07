import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Questo "Interceptor" viene eseguito PRIMA di ogni chiamata
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Se il token esiste, lo aggiungiamo a tutte le richieste
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// (Opzionale) Interceptor per gestire errori 401 (token scaduto)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se il server dice che il token non è più valido, facciamo logout
      localStorage.removeItem('token');
      window.location.href = '/'; // O una logica per resettare Redux
    }
    return Promise.reject(error);
  }
);

export default api;