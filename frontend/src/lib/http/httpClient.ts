import axios from 'axios';
import { isSessionExpired } from './sessionExpiry';
import { tokenStorage } from './tokenStorage';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Cliente Axios con el token JWT adjunto y manejo de sesión expirada. */
export const httpClient = axios.create({ baseURL });

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isSessionExpired(error) && window.location.pathname !== '/login') {
      tokenStorage.clear();
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);
