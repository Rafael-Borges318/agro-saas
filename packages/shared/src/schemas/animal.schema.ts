import { z } from 'zod';

const especieEnum = z.enum(['BOVINO', 'SUINO', 'AVICOLA', 'OVINO', 'CAPRINO', 'EQUINO', 'OUTRO']);
const sexoEnum = z.enum(['MACHO', 'FEMEA']);
const statusEnum = z.enum(['ATIVO', 'VENDIDO', 'MORTO', 'TRANSFERIDO']);

export const animalSchema = z.object({
  propriedadeId: z.string().uuid('ID de propriedade inválido'),
  nome: z.string().optional(),
  numeroIdentificacao: z.string().optional(),
  especie: especieEnum,
  raca: z.string().optional(),
  sexo: sexoEnum,
  dataNascimento: z.string().datetime().optional(),
  pesoKg: z.number().positive().optional(),
  status: statusEnum.default('ATIVO'),
  observacoes: z.string().max(1000).optional(),
});

export type AnimalInput = z.infer<typeof animalSchema>;
