// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // URL do seu backend
  withCredentials: true, // para permitir envio/recebimento de cookies
});



export default api;
