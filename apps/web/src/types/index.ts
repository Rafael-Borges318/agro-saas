export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  status: 'error' | 'validation_error';
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PRODUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string;
  onboardingCompleted: boolean;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface Plan {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  features: string[];
  limitePropriedades: number;
  limiteAnimais: number;
  status: 'ATIVO' | 'INATIVO' | 'ARQUIVADO';
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

export interface CurrentWeather {
  cidade: string;
  temperatura: number;
  sensacao: number;
  umidade: number;
  chuva: boolean;
  chuvaAmm: number;
  vento: number;
  ventoDir?: string;
  descricao: string;
  icone: string;
  lat: number;
  lon: number;
}

export interface MonthlyClimate {
  mes: string;
  mesNum: number;
  tempMedia: number;
  tempMin: number;
  tempMax: number;
  precipitacaoMm: number;
  chanceChuva: number;
  tendencia: 'seco' | 'chuvoso' | 'estável';
}

export interface CityFavorite {
  name: string;
  lat: number;
  lon: number;
}

export interface ForecastDay {
  data: string;
  tempMin: number;
  tempMax: number;
  descricao: string;
  icone: string;
  chuva: boolean;
  precipitacaoMm: number;
  chanceDeChuva?: number;
}

export interface CityResult {
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

export type TransacaoTipo = 'receita' | 'despesa';

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

export interface Transacao {
  id: string;
  tipo: TransacaoTipo;
  userId: string;
  propriedadeId?: string | null;
  descricao: string;
  valor: number;
  data: string;
  categoria: TransacaoCategoria;
  createdAt: string;
  updatedAt: string;
}

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasMes: number;
  despesasMes: number;
  lucroMes: number;
  periodo: { inicio: string; fim: string };
}

export interface GraficoMes {
  mes: string;
  receitas: number;
  despesas: number;
}

export interface CreateTransacaoData {
  tipo: TransacaoTipo;
  descricao: string;
  valor: number;
  data: string;
  categoria: TransacaoCategoria;
  propriedadeId?: string;
}

export interface PrecoAgricola {
  id: string;
  produto: string;
  preco: number;
  unidade: string;
  estado: string | null;
  fonte: string | null;
  data: string;
  variacaoPct: number;
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'INFO' | 'ALERTA' | 'URGENTE' | 'SISTEMA';
  lida: boolean;
  criadoEm: string;
}

// ─── Animais ──────────────────────────────────────────────────────────────────

export type AnimalEspecie = 'BOVINO' | 'SUINO' | 'AVICOLA' | 'OVINO' | 'CAPRINO' | 'EQUINO' | 'OUTRO';
export type AnimalSexo    = 'MACHO' | 'FEMEA';
export type AnimalStatus  = 'ATIVO' | 'VENDIDO' | 'MORTO' | 'TRANSFERIDO';
export type AnimalEventoTipo = 'PESAGEM' | 'VACINACAO' | 'VENDA' | 'DOENCA' | 'REPRODUCAO' | 'OBSERVACAO';

export interface Animal {
  id: string;
  propriedadeId: string;
  nome?: string | null;
  numeroIdentificacao?: string | null;
  especie: AnimalEspecie;
  raca?: string | null;
  sexo: AnimalSexo;
  dataNascimento?: string | null;
  pesoKg?: number | null;
  status: AnimalStatus;
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  eventos?: AnimalEvento[];
}

export interface AnimalEvento {
  id: string;
  animalId: string;
  tipo: AnimalEventoTipo;
  descricao: string;
  data: string;
  valor?: number | null;
  createdAt: string;
}

export interface AnimalStats {
  total: number;
  ativos: number;
  porEspecie: Record<string, number>;
  pesoMedio: number | null;
}

export interface CreateAnimalData {
  propriedadeId: string;
  especie: AnimalEspecie;
  sexo: AnimalSexo;
  status?: AnimalStatus;
  nome?: string;
  numeroIdentificacao?: string;
  raca?: string;
  dataNascimento?: string;
  pesoKg?: number;
  observacoes?: string;
}

export interface CreateEventoData {
  tipo: AnimalEventoTipo;
  descricao: string;
  data: string;
  valor?: number;
}

export interface ListAnimaisFilters {
  especie?: AnimalEspecie;
  status?: AnimalStatus;
  search?: string;
  orderBy?: 'nome' | 'pesoKg' | 'dataNascimento' | 'createdAt';
  order?: 'asc' | 'desc';
}
