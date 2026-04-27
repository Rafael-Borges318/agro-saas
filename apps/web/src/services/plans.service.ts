import { api } from './api';
import type { Plan } from '../types';

export const plansService = {
  list: () => api.get<{ data: Plan[] }>('/plans'),

  subscribe: (planId: string) =>
    api.post<{ data: { id: string; status: string } }>('/subscriptions', { planId }),

  getMySubscription: () =>
    api.get<{ data: { id: string; status: string; plan: Plan } | null }>('/subscriptions/me'),
};
