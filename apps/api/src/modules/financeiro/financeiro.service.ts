import { z } from 'zod';
import { Prisma, TransacaoCategoria } from '@prisma/client';
import { prisma } from '../../config/db';
import { logger } from '../../lib/logger';
import { startOfMonth, endOfMonth } from '../../utils/date';
import { ForbiddenError, NotFoundError } from '../../utils/AppError';

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const;

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

/* ─── Zod schemas ────────────────────────────────────────────────────────── */

export const createTransacaoSchema = z.object({
  tipo: z.enum(['receita', 'despesa'], { required_error: 'Tipo é obrigatório' }),
  descricao: z
    .string({ required_error: 'Descrição é obrigatória' })
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valor: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser maior que zero')
    .max(999_999_999, 'Valor inválido'),
  data: z
    .string({ required_error: 'Data é obrigatória' })
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Data inválida' })
    .transform((d) => new Date(d)),
  categoria: z.nativeEnum(TransacaoCategoria).default('OUTROS'),
  propriedadeId: z.string().uuid('ID da propriedade inválido').optional(),
});

export const queryTransacoesSchema = z.object({
  mes: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(
      z
        .string()
        .regex(/^\d{4}-\d{2}$/, 'Formato inválido — use YYYY-MM')
        .optional(),
    ),
  tipo: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === undefined ? 'todos' : v))
    .pipe(z.enum(['todos', 'receita', 'despesa'])),
  categoria: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.nativeEnum(TransacaoCategoria).optional()),
});

export const deleteTransacaoQuerySchema = z.object({
  tipo: z.enum(['receita', 'despesa'], { required_error: 'Informe o tipo da transação' }),
});

export type CreateTransacaoDTO = z.infer<typeof createTransacaoSchema>;
export type QueryTransacoesDTO = z.infer<typeof queryTransacoesSchema>;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function safeNum(value: number | null | undefined): number {
  const n = Number(value);
  return isFinite(n) && n >= 0 ? n : 0;
}

function buildDateRange(mes?: string): Prisma.DateTimeFilter | undefined {
  if (!mes) return undefined;
  const [year, month] = mes.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return undefined;
  const start = new Date(year, month - 1, 1);
  return { gte: startOfMonth(start), lte: endOfMonth(start) };
}

function propScope(userId: string): Prisma.PropriedadeWhereInput {
  return { produtor: { userId } };
}

async function verifyPropriedadeOwnership(userId: string, propriedadeId: string): Promise<void> {
  const prop = await prisma.propriedade.findFirst({
    where: { id: propriedadeId, produtor: { userId } },
    select: { id: true },
  });
  if (!prop) throw new ForbiddenError('Propriedade não encontrada ou acesso negado');
}

/* ─── Service ────────────────────────────────────────────────────────────── */

export const financeiroService = {
  async createTransacao(userId: string, userRole: string, data: CreateTransacaoDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    let resolvedPropId: string;

    if (data.propriedadeId) {
      // Admins can create for any property; regular users must own it
      if (!isAdmin) await verifyPropriedadeOwnership(userId, data.propriedadeId);
      resolvedPropId = data.propriedadeId;
    } else {
      // Auto-assign: admins get any property in the system; users get their own
      const prop = await prisma.propriedade.findFirst({
        where: isAdmin ? undefined : { produtor: { userId } },
        select: { id: true },
      });
      if (!prop) {
        throw new ForbiddenError(
          isAdmin
            ? 'Nenhuma propriedade cadastrada no sistema ainda.'
            : 'Nenhuma propriedade cadastrada. Cadastre uma propriedade primeiro.',
        );
      }
      resolvedPropId = prop.id;
    }

    const payload = {
      propriedadeId: resolvedPropId,
      descricao: data.descricao,
      valor: data.valor,
      data: data.data,
      categoria: data.categoria,
    };

    if (data.tipo === 'receita') {
      const rec = await prisma.receita.create({ data: payload });
      return { ...rec, tipo: 'receita' as const };
    }

    const desp = await prisma.despesa.create({ data: payload });
    return { ...desp, tipo: 'despesa' as const };
  },

  async deleteTransacao(userId: string, userRole: string, id: string, tipo: 'receita' | 'despesa') {
    const isAdmin = ADMIN_ROLES.has(userRole);

    if (tipo === 'receita') {
      const tx = await prisma.receita.findFirst({
        where: isAdmin ? { id } : { id, propriedade: propScope(userId) },
        select: { id: true },
      });
      if (!tx) throw new NotFoundError('Receita');
      await prisma.receita.delete({ where: { id } });
    } else {
      const tx = await prisma.despesa.findFirst({
        where: isAdmin ? { id } : { id, propriedade: propScope(userId) },
        select: { id: true },
      });
      if (!tx) throw new NotFoundError('Despesa');
      await prisma.despesa.delete({ where: { id } });
    }
  },

  async listTransacoes(userId: string, userRole: string, filters: QueryTransacoesDTO) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const dateRange = buildDateRange(filters.mes);

    const receitaWhere: Prisma.ReceitaWhereInput = {
      propriedade: isAdmin ? undefined : propScope(userId),
      data: dateRange,
      categoria: filters.categoria,
    };

    const despesaWhere: Prisma.DespesaWhereInput = {
      propriedade: isAdmin ? undefined : propScope(userId),
      data: dateRange,
      categoria: filters.categoria,
    };

    const fetchReceitas =
      filters.tipo !== 'despesa'
        ? prisma.receita.findMany({ where: receitaWhere, orderBy: { data: 'desc' } })
        : Promise.resolve([] as Awaited<ReturnType<typeof prisma.receita.findMany>>);

    const fetchDespesas =
      filters.tipo !== 'receita'
        ? prisma.despesa.findMany({ where: despesaWhere, orderBy: { data: 'desc' } })
        : Promise.resolve([] as Awaited<ReturnType<typeof prisma.despesa.findMany>>);

    const [receitas, despesas] = await Promise.all([fetchReceitas, fetchDespesas]);

    return [
      ...receitas.map((r) => ({ ...r, tipo: 'receita' as const })),
      ...despesas.map((d) => ({ ...d, tipo: 'despesa' as const })),
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  },

  async resumo(userId: string, userRole: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const now = new Date();
    const mesStart = startOfMonth(now);
    const mesEnd = endOfMonth(now);

    logger.debug(`[financeiro] resumo userId=${userId} isAdmin=${isAdmin}`);

    const scope: Prisma.PropriedadeWhereInput | undefined = isAdmin ? undefined : propScope(userId);
    const mesFilter: Prisma.DateTimeFilter = { gte: mesStart, lte: mesEnd };

    const [totalRec, totalDesp, mesRec, mesDesp] = await Promise.all([
      prisma.receita.aggregate({ where: { propriedade: scope }, _sum: { valor: true } }),
      prisma.despesa.aggregate({ where: { propriedade: scope }, _sum: { valor: true } }),
      prisma.receita.aggregate({ where: { propriedade: scope, data: mesFilter }, _sum: { valor: true } }),
      prisma.despesa.aggregate({ where: { propriedade: scope, data: mesFilter }, _sum: { valor: true } }),
    ]);

    const totalReceitas = safeNum(totalRec._sum?.valor);
    const totalDespesas = safeNum(totalDesp._sum?.valor);
    const receitasMes   = safeNum(mesRec._sum?.valor);
    const despesasMes   = safeNum(mesDesp._sum?.valor);

    return {
      totalReceitas,
      totalDespesas,
      saldo:      totalReceitas - totalDespesas,
      receitasMes,
      despesasMes,
      lucroMes:   receitasMes - despesasMes,
      periodo: { inicio: mesStart, fim: mesEnd },
    };
  },

  async grafico(userId: string, userRole: string) {
    const isAdmin = ADMIN_ROLES.has(userRole);
    const now = new Date();

    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        inicio: startOfMonth(d),
        fim:    endOfMonth(d),
        label:  MESES_PT[d.getMonth() as 0|1|2|3|4|5|6|7|8|9|10|11],
        year:   d.getFullYear(),
      };
    });

    const scope: Prisma.PropriedadeWhereInput | undefined = isAdmin ? undefined : propScope(userId);
    const windowStart = buckets[0]!.inicio;

    const [receitas, despesas] = await Promise.all([
      prisma.receita.findMany({
        where: { propriedade: scope, data: { gte: windowStart } },
        select: { data: true, valor: true },
      }),
      prisma.despesa.findMany({
        where: { propriedade: scope, data: { gte: windowStart } },
        select: { data: true, valor: true },
      }),
    ]);

    return buckets.map((bucket) => ({
      mes:      `${bucket.label}/${String(bucket.year).slice(2)}`,
      receitas: safeNum(
        receitas
          .filter((r) => r.data >= bucket.inicio && r.data <= bucket.fim)
          .reduce((sum, r) => sum + r.valor, 0),
      ),
      despesas: safeNum(
        despesas
          .filter((d) => d.data >= bucket.inicio && d.data <= bucket.fim)
          .reduce((sum, d) => sum + d.valor, 0),
      ),
    }));
  },
};
