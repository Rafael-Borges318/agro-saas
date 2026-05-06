import axios, { AxiosError } from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry on 5xx with exponential backoff (max 2 retries: 500ms, 1000ms)
    const config = error.config as (typeof error.config & { _retryCount?: number }) | undefined;
    if (config && error.response && error.response.status >= 500) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= 2) {
        await new Promise((resolve) => setTimeout(resolve, config._retryCount! * 500));
        return api(config);
      }
    }

    return Promise.reject(error);
  },
);
