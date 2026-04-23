import { prisma } from '../../config/db';
import { NotFoundError, ConflictError } from '../../utils/AppError';

export const produtoresService = {
  async list() {
    return prisma.produtor.findMany({
      include: { user: { select: { name: true, email: true } } },
    });
  },

  async findById(id: string) {
    const p = await prisma.produtor.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } }, propriedades: true },
    });
    if (!p) throw new NotFoundError('Produtor');
    return p;
  },

  async create(userId: string, data: { cpf: string; telefone?: string; estado?: string; cidade?: string; bio?: string }) {
    const existing = await prisma.produtor.findUnique({ where: { cpf: data.cpf } });
    if (existing) throw new ConflictError('CPF já cadastrado');
    return prisma.produtor.create({ data: { userId, ...data } });
  },

  async update(id: string, data: Partial<{ telefone: string; estado: string; cidade: string; bio: string }>) {
    const p = await prisma.produtor.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Produtor');
    return prisma.produtor.update({ where: { id }, data });
  },
};
