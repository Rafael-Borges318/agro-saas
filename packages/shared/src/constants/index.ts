export const APP_NAME = 'AgroSaaS';
export const APP_VERSION = '1.0.0';

export const API_PREFIX = '/api/v1';

export const ROLES = {
  PRODUTOR: 'PRODUTOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const PLAN_NAMES = {
  FREE: 'Gratuito',
  BASICO: 'Básico',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
} as const;

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const ESPECIES_ANIMAIS = [
  'BOVINO', 'SUINO', 'AVICOLA', 'OVINO', 'CAPRINO', 'EQUINO', 'OUTRO',
] as const;

export const CATEGORIAS_TRANSACAO = [
  'ALIMENTACAO', 'SAUDE_ANIMAL', 'INSUMOS', 'EQUIPAMENTOS',
  'COMBUSTIVEL', 'MAO_DE_OBRA', 'VENDA_ANIMAL', 'VENDA_PRODUCAO',
  'FINANCIAMENTO', 'OUTROS',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Production profile ────────────────────────────────────────────────────────

export const TIPO_PRODUCAO = ['Vegetal', 'Animal', 'Misto'] as const;
export type TipoProducao = typeof TIPO_PRODUCAO[number];

export const PRODUCAO_VEGETAL = [
  'Soja',
  'Milho',
  'Arroz',
  'Trigo',
  'Feijão',
  'Café',
  'Algodão',
  'Cana-de-açúcar',
  'Sorgo',
  'Mandioca',
  'Hortaliças',
  'Frutas',
  'Uva',
  'Maçã',
  'Fumo',
  'Pastagem',
  'Silagem',
  'Reflorestamento',
] as const;
export type ProducaoVegetal = typeof PRODUCAO_VEGETAL[number];

export const PRODUCAO_ANIMAL = [
  'Bovinos de corte',
  'Bovinos de leite',
  'Suínos',
  'Aves',
  'Ovinos',
  'Caprinos',
  'Equinos',
  'Piscicultura',
  'Apicultura',
] as const;
export type ProducaoAnimal = typeof PRODUCAO_ANIMAL[number];

export const OBJETIVOS_PRODUTOR = [
  'Aumentar produtividade e receita',
  'Reduzir custos operacionais',
  'Organizar a gestão da propriedade',
  'Diversificar a produção',
  'Acessar crédito rural',
  'Melhorar controle financeiro',
  'Monitorar preços e mercado',
] as const;
export type ObjetivoProdutor = typeof OBJETIVOS_PRODUTOR[number];
