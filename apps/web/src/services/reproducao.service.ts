import { api } from './api';
import type {
  ApiResponse,
  CreateReproducaoData,
  Reproducao,
  ReproducaoUpcoming,
  UpdateReproducaoData,
} from '../types';

export const reproducaoService = {
  list: (animalId: string) =>
    api.get<ApiResponse<Reproducao[]>>(`/animais/${animalId}/reproducao`).then((r) => r.data.data),

  create: (animalId: string, data: CreateReproducaoData) =>
    api.post<ApiResponse<Reproducao>>(`/animais/${animalId}/reproducao`, data).then((r) => r.data.data),

  update: (animalId: string, repId: string, data: UpdateReproducaoData) =>
    api.patch<ApiResponse<Reproducao>>(`/animais/${animalId}/reproducao/${repId}`, data)
      .then((r) => r.data.data),

  remove: (animalId: string, repId: string) =>
    api.delete(`/animais/${animalId}/reproducao/${repId}`),

  upcoming: (days = 14) =>
    api.get<ApiResponse<ReproducaoUpcoming[]>>('/animais/reproducao/upcoming', { params: { days } })
      .then((r) => r.data.data),
};
