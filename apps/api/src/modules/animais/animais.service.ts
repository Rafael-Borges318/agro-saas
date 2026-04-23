import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';
import { AnimalEspecie, AnimalSexo, AnimalStatus } from '@prisma/client';

type CreateAnimalDTO = {
  propriedadeId: string;
  nome?: string;
  numeroIdentificacao?: string;
  especie: AnimalEspecie;
  raca?: string;
  sexo: AnimalSexo;
  dataNascimento?: Date;
  pesoKg?: number;
  status?: AnimalStatus;
  observacoes?: string;
};

export const animaisService = {
  list(propriedadeId?: string) {
    return prisma.animal.findMany({
      where: propriedadeId ? { propriedadeId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    const a = await prisma.animal.findUnique({ where: { id } });
    if (!a) throw new NotFoundError('Animal');
    return a;
  },

  create(data: CreateAnimalDTO) {
    return prisma.animal.create({ data });
  },

  async update(id: string, data: Partial<CreateAnimalDTO>) {
    const a = await prisma.animal.findUnique({ where: { id } });
    if (!a) throw new NotFoundError('Animal');
    return prisma.animal.update({ where: { id }, data });
  },

  async remove(id: string) {
    const a = await prisma.animal.findUnique({ where: { id } });
    if (!a) throw new NotFoundError('Animal');
    await prisma.animal.delete({ where: { id } });
  },
};
