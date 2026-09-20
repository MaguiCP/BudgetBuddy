import axios from 'axios';

export const getApiErrorMessage = (error, fallback = 'Ocorreu um erro. Tenta novamente.') => {
  if (!error.response) {
    return 'Não foi possível contactar o servidor. Confirma que o backend está ligado.';
  }

  const responseData = error.response.data;

  if (typeof responseData?.error === 'string') {
    return responseData.error;
  }

  if (typeof responseData?.message === 'string') {
    return responseData.message;
  }

  if (Array.isArray(responseData?.details)) {
    return responseData.details
      .map((detail) => detail.message)
      .filter(Boolean)
      .join(' ');
  }

  if (error.response.status === 409) {
    return 'Já existe um registo com estes dados.';
  }

  return fallback;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;