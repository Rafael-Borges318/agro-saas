import { prisma } from '../../config/db';
import { TransacaoCategoria } from '@prisma/client';
import { startOfMonth, endOfMonth } from '../../utils/date';

type CreateDespesaDTO = { propriedadeId: string; descricao: string; valor: number; data: Date; categoria?: TransacaoCategoria };
type CreateReceitaDTO = { propriedadeId: string; descricao: string; valor: number; data: Date; categoria?: TransacaoCategoria };

export const financeiroService = {
  async resumo(propriedadeId: string, mes?: Date) {
    const ref = mes || new Date();
    const inicio = startOfMonth(ref);
    const fim = endOfMonth(ref);
    const where = { propriedadeId, data: { gte: inicio, lte: fim } };

    const [despesas, receitas] = await Promise.all([
      prisma.despesa.aggregate({ where, _sum: { valor: true } }),
      prisma.receita.aggregate({ where, _sum: { valor: true } }),
    ]);

    const totalDespesas = despesas._sum.valor ?? 0;
    const totalReceitas = receitas._sum.valor ?? 0;
    return { totalDespesas, totalReceitas, saldo: totalReceitas - totalDespesas, periodo: { inicio, fim } };
  },

  listDespesas: (propriedadeId: string) =>
    prisma.despesa.findMany({ where: { propriedadeId }, orderBy: { data: 'desc' } }),

  createDespesa: (data: CreateDespesaDTO) => prisma.despesa.create({ data }),

  listReceitas: (propriedadeId: string) =>
    prisma.receita.findMany({ where: { propriedadeId }, orderBy: { data: 'desc' } }),

  createReceita: (data: CreateReceitaDTO) => prisma.receita.create({ data }),
};
