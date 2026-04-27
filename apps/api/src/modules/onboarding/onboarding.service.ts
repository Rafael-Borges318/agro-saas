import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';
import type { OnboardingDTO } from './onboarding.schema';

export const onboardingService = {
  async complete(userId: string, dto: OnboardingDTO) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Usuário');

    const produtorData = {
      telefone: dto.telefone,
      estado: dto.estado,
      cidade: dto.cidade,
      tipoProducao: dto.tipoProducao,
      producoesVegetais: dto.producoesVegetais ?? [],
      producoesAnimais: dto.producoesAnimais ?? [],
      objetivoPrincipal: dto.objetivoPrincipal,
    };

    const existingProdutor = await prisma.produtor.findUnique({ where: { userId } });

    const produtor = existingProdutor
      ? await prisma.produtor.update({ where: { userId }, data: produtorData })
      : await prisma.produtor.create({ data: { userId, ...produtorData } });

    // Create the first property (skip if one already exists)
    const existingProp = await prisma.propriedade.findFirst({ where: { produtorId: produtor.id } });
    if (!existingProp) {
      await prisma.propriedade.create({
        data: {
          produtorId: produtor.id,
          nome: dto.nomePropriedade,
          areaHectares: dto.areaHectares,
          municipio: dto.municipio,
          estado: dto.estado,
        },
      });
    }

    return prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingCompleted: true,
      },
    });
  },
};
