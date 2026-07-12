import { BACKEND_API_URL } from '@env';
import { Platform } from 'react-native';
import axios from 'axios';

const baseURL =
  BACKEND_API_URL ??
  (Platform.OS === 'android' ? 'http://localhost:3000' : 'http://localhost:3000');

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

    return Promise.reject(new Error(message));
  },
);
