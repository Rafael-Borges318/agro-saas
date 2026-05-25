import { api } from './api';
import type { ApiResponse, CreateVacinaData, UpdateVacinaData, Vacina, VacinaUpcoming } from '../types';

export const vacinasService = {
  list: (animalId: string) =>
    api.get<ApiResponse<Vacina[]>>(`/animais/${animalId}/vacinas`).then((r) => r.data.data),

  create: (animalId: string, data: CreateVacinaData) =>
    api.post<ApiResponse<Vacina>>(`/animais/${animalId}/vacinas`, data).then((r) => r.data.data),

  update: (animalId: string, vacId: string, data: UpdateVacinaData) =>
    api.patch<ApiResponse<Vacina>>(`/animais/${animalId}/vacinas/${vacId}`, data).then((r) => r.data.data),

  remove: (animalId: string, vacId: string) =>
    api.delete(`/animais/${animalId}/vacinas/${vacId}`),

  upcoming: (days = 30) =>
    api.get<ApiResponse<VacinaUpcoming[]>>('/animais/vacinas/upcoming', { params: { days } })
      .then((r) => r.data.data),
};
