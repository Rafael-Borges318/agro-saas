import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';
import { CulturaStatus } from '@prisma/client';

type CreateCulturaDTO = {
  propriedadeId: string;
  nome: string;
  tipo: string;
  areaHectares: number;
  dataPlantio?: Date;
  dataColheitaEstimada?: Date;
  status?: CulturaStatus;
  producaoKg?: number;
  observacoes?: string;
};

export const culturasService = {
  list: (propriedadeId?: string) =>
    prisma.cultura.findMany({ where: propriedadeId ? { propriedadeId } : undefined, orderBy: { createdAt: 'desc' } }),

  async findById(id: string) {
    const c = await prisma.cultura.findUnique({ where: { id } });
    if (!c) throw new NotFoundError('Cultura');
    return c;
  },

  create: (data: CreateCulturaDTO) => prisma.cultura.create({ data }),

  async update(id: string, data: Partial<CreateCulturaDTO>) {
    const c = await prisma.cultura.findUnique({ where: { id } });
    if (!c) throw new NotFoundError('Cultura');
    return prisma.cultura.update({ where: { id }, data });
  },

  async remove(id: string) {
    const c = await prisma.cultura.findUnique({ where: { id } });
    if (!c) throw new NotFoundError('Cultura');
    await prisma.cultura.delete({ where: { id } });
  },
};
