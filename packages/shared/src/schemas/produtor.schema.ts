import { z } from 'zod';

export const produtorSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido (somente números, 11 dígitos)'),
  telefone: z.string().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 letras').optional(),
  cidade: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export const propriedadeSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  areaHectares: z.number().positive('Área deve ser positiva'),
  municipio: z.string().min(2),
  estado: z.string().length(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ProdutorInput = z.infer<typeof produtorSchema>;
export type PropriedadeInput = z.infer<typeof propriedadeSchema>;
