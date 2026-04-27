import { z } from 'zod';

const TIPO_PRODUCAO = ['Vegetal', 'Animal', 'Misto'] as const;

const PRODUCAO_VEGETAL = [
  'Soja', 'Milho', 'Arroz', 'Trigo', 'Feijão', 'Café', 'Algodão',
  'Cana-de-açúcar', 'Sorgo', 'Mandioca', 'Hortaliças', 'Frutas',
  'Uva', 'Maçã', 'Fumo', 'Pastagem', 'Silagem', 'Reflorestamento',
] as const;

const PRODUCAO_ANIMAL = [
  'Bovinos de corte', 'Bovinos de leite', 'Suínos', 'Aves',
  'Ovinos', 'Caprinos', 'Equinos', 'Piscicultura', 'Apicultura',
] as const;

const OBJETIVOS_PRODUTOR = [
  'Aumentar produtividade e receita',
  'Reduzir custos operacionais',
  'Organizar a gestão da propriedade',
  'Diversificar a produção',
  'Acessar crédito rural',
  'Melhorar controle financeiro',
  'Monitorar preços e mercado',
] as const;

export const onboardingSchema = z.object({
  // Step 1 — contact & location
  telefone: z.string().optional(),
  estado: z
    .string()
    .length(2, 'Use a sigla do estado (ex: MT)')
    .transform((v) => v.toUpperCase()),
  cidade: z.string().min(2, 'Informe a cidade'),

  // Step 2 — property
  nomePropriedade: z.string().min(2, 'Informe o nome da propriedade'),
  municipio: z.string().min(2, 'Informe o município'),
  areaHectares: z.coerce.number().positive('A área deve ser positiva'),

  // Step 2 — production profile
  tipoProducao: z.enum(TIPO_PRODUCAO).optional(),
  producoesVegetais: z
    .array(z.enum(PRODUCAO_VEGETAL))
    .optional()
    .default([]),
  producoesAnimais: z
    .array(z.enum(PRODUCAO_ANIMAL))
    .optional()
    .default([]),
  objetivoPrincipal: z
    .enum(OBJETIVOS_PRODUTOR)
    .optional(),
});

export type OnboardingDTO = z.infer<typeof onboardingSchema>;
