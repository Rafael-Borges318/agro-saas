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

// ─── Propriedades ─────────────────────────────────────────────────────────────

export interface Propriedade {
  id: string;
  produtorId: string;
  nome: string;
  areaHectares: number;
  municipio: string;
  estado: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
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

// ─── Vacinas ──────────────────────────────────────────────────────────────────

export interface Vacina {
  id: string;
  animalId: string;
  nomeVacina: string;
  dataAplicacao: string;
  proximaDose?: string | null;
  observacoes?: string | null;
  createdAt: string;
}

export interface CreateVacinaData {
  nomeVacina: string;
  dataAplicacao: string;
  proximaDose?: string;
  observacoes?: string;
}

export type UpdateVacinaData = Partial<CreateVacinaData>;

// ─── Pesagens ─────────────────────────────────────────────────────────────────

export interface Pesagem {
  id: string;
  animalId: string;
  pesoKg: number;
  dataPesagem: string;
  observacoes?: string | null;
  createdAt: string;
}

export interface CreatePesagemData {
  pesoKg: number;
  dataPesagem: string;
  observacoes?: string;
  atualizarPeso?: boolean;
}

// ─── Reprodução ───────────────────────────────────────────────────────────────

export type ReproducaoStatus = 'PRENHA' | 'PARTO_REALIZADO' | 'VAZIA';

export interface Reproducao {
  id: string;
  animalId: string;
  dataCobertura: string;
  dataPrevistaParto?: string | null;
  dataPartoReal?: string | null;
  parceiroId?: string | null;
  parceiro?: {
    id: string;
    nome?: string | null;
    numeroIdentificacao?: string | null;
    especie: string;
  } | null;
  quantidadeFilhos?: number | null;
  observacoes?: string | null;
  status: ReproducaoStatus;
  createdAt: string;
}

export interface CreateReproducaoData {
  dataCobertura: string;
  dataPrevistaParto?: string;
  dataPartoReal?: string;
  parceiroId?: string;
  quantidadeFilhos?: number;
  observacoes?: string;
  status?: ReproducaoStatus;
}

export type UpdateReproducaoData = Partial<CreateReproducaoData>;

// ─── Upcoming alerts ──────────────────────────────────────────────────────────

export interface VacinaUpcoming extends Vacina {
  animal: {
    id: string;
    nome?: string | null;
    numeroIdentificacao?: string | null;
    especie: string;
  };
}

export interface ReproducaoUpcoming extends Reproducao {
  animal: {
    id: string;
    nome?: string | null;
    numeroIdentificacao?: string | null;
    especie: string;
  };
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export type MarketplaceCategoria =
  | 'INSUMOS'
  | 'MAQUINARIOS'
  | 'PECUARIA'
  | 'GRAOS'
  | 'FERTILIZANTES'
  | 'FERRAMENTAS'
  | 'SERVICOS'
  | 'SEMENTES'
  | 'RACAO'
  | 'IRRIGACAO'
  | 'HORTIFRUTI'
  | 'EQUIPAMENTOS';

export type MarketplaceStatus = 'ATIVO' | 'INATIVO' | 'VENDIDO' | 'REMOVIDO';

export interface MarketplaceProduct {
  id: string;
  titulo: string;
  descricao: string;
  categoria: MarketplaceCategoria;
  preco: number;
  precoNegociavel: boolean;
  quantidade: number;
  unidade: string;
  cidade?: string | null;
  estado?: string | null;
  imageUrl?: string | null;
  imagensExtra: string[];
  externalUrl?: string | null;
  contatoWhatsapp?: string | null;
  contatoEmail?: string | null;
  contatoTelefone?: string | null;
  destaque: boolean;
  visualizacoes: number;
  status: MarketplaceStatus;
  produtorId: string;
  produtor: {
    id: string;
    cidade?: string | null;
    estado?: string | null;
    user: { name: string };
  };
  _count: { favoritos: number };
  isFavorito?: boolean;
  relacionados?: MarketplaceProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilters {
  search?: string;
  categoria?: MarketplaceCategoria;
  estado?: string;
  cidade?: string;
  precoMin?: number;
  precoMax?: number;
  orderBy?: 'recente' | 'preco_asc' | 'preco_desc' | 'visualizacoes';
  page?: number;
  limit?: number;
}

export interface MarketplaceListResult {
  data: MarketplaceProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MarketplacePublicStats {
  totalProdutos: number;
  totalProdutores: number;
  totalEstados: number;
}

export interface MarketplaceCategoryCount {
  categoria: MarketplaceCategoria;
  total: number;
}

export interface MarketplaceMyStats {
  ativos: number;
  inativos: number;
  vendidos: number;
  totalViews: number;
  totalFavoritos: number;
  totalContatos: number;
}

export interface CreateMarketplaceData {
  titulo: string;
  descricao: string;
  categoria: MarketplaceCategoria;
  preco: number;
  precoNegociavel?: boolean;
  quantidade: number;
  unidade?: string;
  cidade?: string;
  estado?: string;
  imageUrl?: string;
  imagensExtra?: string[];
  externalUrl?: string;
  contatoWhatsapp?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
}

export type UpdateMarketplaceData = Partial<CreateMarketplaceData>;
