import { api } from './api';
import { cache, TTL } from './cache';
import type { ApiResponse } from '../types';

export interface AdminStats {
  users: number;
  produtores: number;
  animais: number;
  culturas: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'PRODUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
}

export const adminService = {
  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    return cache.dedupe(
      'admin:stats',
      () => api.get<ApiResponse<AdminStats>>('/admin/stats').then((r) => r.data),
      TTL.ADMIN,
    );
  },

  listUsers: async (): Promise<ApiResponse<AdminUser[]>> => {
    return cache.dedupe(
      'admin:users',
      () => api.get<ApiResponse<AdminUser[]>>('/admin/users').then((r) => r.data),
      TTL.ADMIN,
    );
  },

  toggleUser: async (id: string): Promise<ApiResponse<AdminUser>> => {
    cache.delete('admin:users');
    const res = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/toggle`);
    return res.data;
  },
};
