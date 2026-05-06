import { api } from './api';
import type {
  ApiResponse,
  CreateTransacaoData,
  GraficoMes,
  ResumoFinanceiro,
  Transacao,
  TransacaoCategoria,
  TransacaoTipo,
} from '../types';

export interface TransacoesFilters {
  mes?: string;
  tipo?: TransacaoTipo | 'todos';
  categoria?: TransacaoCategoria;
}

export const financeiroService = {
  resumo: () =>
    api.get<ApiResponse<ResumoFinanceiro>>('/financeiro/resumo'),

  grafico: () =>
    api.get<ApiResponse<GraficoMes[]>>('/financeiro/grafico'),

  listTransacoes: (filters: TransacoesFilters = {}) => {
    const params: Record<string, string> = {};
    if (filters.mes)       params.mes       = filters.mes;
    if (filters.tipo && filters.tipo !== 'todos') params.tipo = filters.tipo;
    if (filters.categoria) params.categoria = filters.categoria;
    return api.get<ApiResponse<Transacao[]>>('/financeiro/transacoes', { params });
  },

  createTransacao: (data: CreateTransacaoData) =>
    api.post<ApiResponse<Transacao>>('/financeiro/transacoes', data),

  deleteTransacao: (id: string, tipo: TransacaoTipo) =>
    api.delete(`/financeiro/transacoes/${id}`, { params: { tipo } }),
};
