import axios from 'axios';

export const api = axios.create({
  // O Vite usa 'import.meta.env' para ler variáveis de ambiente.
  // Se não houver uma URL de produção configurada, ele cai no localhost automaticamente.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Helpdesk:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});