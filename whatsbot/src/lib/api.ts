// src/lib/api.ts
import axios from 'axios';
import router from 'next/router';

const api = axios.create({
  baseURL: 'http://localhost:3001', // URL do seu backend
  withCredentials: true, // para permitir envio/recebimento de cookies
});

// Interceptor de resposta
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn('Não autenticado, redirecionando para login...');
//       router.push('/login');
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Não autenticado, redirecionando para login...');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export default api;
