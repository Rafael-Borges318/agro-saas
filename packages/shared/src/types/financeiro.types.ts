export type TransacaoCategoria =
  | 'ALIMENTACAO'
  | 'SAUDE_ANIMAL'
  | 'INSUMOS'
  | 'EQUIPAMENTOS'
  | 'COMBUSTIVEL'
  | 'MAO_DE_OBRA'
  | 'VENDA_ANIMAL'
  | 'VENDA_PRODUCAO'
  | 'FINANCIAMENTO'
  | 'OUTROS';

export interface Despesa {
  id: string;
  propriedadeId: string;
  descricao: string;
  valor: number;
  data: Date;
  categoria: TransacaoCategoria;
  comprovante?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receita {
  id: string;
  propriedadeId: string;
  descricao: string;
  valor: number;
  data: Date;
  categoria: TransacaoCategoria;
  comprovante?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  periodo: {
    inicio: Date;
    fim: Date;
  };
}

export type PlanStatus = 'ATIVO' | 'INATIVO' | 'ARQUIVADO';
export type SubscriptionStatus = 'ATIVA' | 'CANCELADA' | 'EXPIRADA' | 'TRIAL';

export interface Plan {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  features: string[];
  limitePropriedades: number;
  limiteAnimais: number;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  dataInicio: Date;
  dataFim: Date;
  createdAt: Date;
  updatedAt: Date;
}
