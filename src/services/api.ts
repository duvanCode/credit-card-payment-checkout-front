import { BACKEND_API_URL } from '@env';
import axios from 'axios';

const baseURL = BACKEND_API_URL.trim();

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      'No fue posible conectar con el servidor.';

    if (error && typeof error === 'object') {
      error.message = message;
    }

    return Promise.reject(error);
  },
);
