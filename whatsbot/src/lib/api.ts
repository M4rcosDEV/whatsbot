// src/lib/api.ts
import axios from 'axios';
import router from 'next/router';

const api = axios.create({
  baseURL: 'http://localhost:3001', // URL do seu backend
  withCredentials: true, // para permitir envio/recebimento de cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Remova o redirecionamento automático
    if (error.response?.status === 401) {
      console.warn('Erro 401 - Não autenticado');
      // Não redireciona aqui
    }
    return Promise.reject(error);
  }
);

export default api;
