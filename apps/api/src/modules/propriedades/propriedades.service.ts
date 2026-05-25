import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

type CreatePropriedadeDTO = {
  produtorId: string;
  nome: string;
  areaHectares: number;
  municipio: string;
  estado: string;
  latitude?: number;
  longitude?: number;
};

export const propriedadesService = {
  listForUser(userId: string, userRole: string) {
    if (ADMIN_ROLES.has(userRole)) {
      return prisma.propriedade.findMany({ orderBy: { nome: 'asc' } });
    }
    return prisma.propriedade.findMany({
      where: { produtor: { userId } },
      orderBy: { nome: 'asc' },
    });
  },

  list(produtorId?: string) {
    return prisma.propriedade.findMany({
      where: produtorId ? { produtorId } : undefined,
      orderBy: { nome: 'asc' },
    });
  },

  async findById(id: string) {
    const p = await prisma.propriedade.findUnique({
      where: { id },
      include: { animais: true, culturas: true },
    });
    if (!p) throw new NotFoundError('Propriedade');
    return p;
  },

  create(data: CreatePropriedadeDTO) {
    return prisma.propriedade.create({ data });
  },

  async update(id: string, data: Partial<Omit<CreatePropriedadeDTO, 'produtorId'>>) {
    const p = await prisma.propriedade.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Propriedade');
    return prisma.propriedade.update({ where: { id }, data });
  },

  async remove(id: string) {
    const p = await prisma.propriedade.findUnique({ where: { id } });
    if (!p) throw new NotFoundError('Propriedade');
    await prisma.propriedade.delete({ where: { id } });
  },
};
