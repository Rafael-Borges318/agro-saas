import { api } from './api';
import type { AuthData } from '../types';

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ data: AuthData }>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post<{ data: AuthData }>('/auth/register', { name, email, password }),

  me: () => api.get<{ data: AuthData['user'] }>('/auth/me'),
};
