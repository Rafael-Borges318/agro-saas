import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/AppError';
import { startOfMonth, endOfMonth } from '../../utils/date';

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const;

/* ─── helpers ────────────────────────────────────────────────────────────── */

function last6Months(): { start: Date; end: Date } {
  const now = new Date();
  const end = endOfMonth(now);
  const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1));
  return { start, end };
}

function mesLabel(date: Date): string {
  return `${MESES_PT[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;
}

async function getPropIds(produtorId: string): Promise<string[]> {
  const props = await prisma.propriedade.findMany({
    where: { produtorId },
    select: { id: true },
  });
  return props.map((p) => p.id);
}

/* ─── service ─────────────────────────────────────────────────────────────── */

export const relatoriosService = {
  // Legacy methods kept intact
  list: (propriedadeId: string) =>
    prisma.relatorio.findMany({ where: { propriedadeId }, orderBy: { criadoEm: 'desc' } }),

  async gerar(propriedadeId: string, tipo: string, titulo: string) {
    return prisma.relatorio.create({
      data: { propriedadeId, tipo, titulo, dados: { geradoEm: new Date() } },
    });
  },

  async remove(id: string) {
    const r = await prisma.relatorio.findUnique({ where: { id } });
    if (!r) throw new NotFoundError('Relatório');
    await prisma.relatorio.delete({ where: { id } });
  },

  /* ── Relatório Financeiro ─────────────────────────────────────────────── */

  async gerarRelatorioFinanceiro(produtorId: string, mes?: string) {
    const produtor = await prisma.produtor.findUnique({ where: { id: produtorId }, select: { id: true } });
    if (!produtor) throw new NotFoundError('Produtor');

    const propIds = await getPropIds(produtorId);
    if (propIds.length === 0) {
      return {
        totalReceitas: 0, totalDespesas: 0, lucroLiquido: 0,
        porCategoria: [], evolucaoMensal: [],
      };
    }

    // Date range for totals
    let dateFilter: { gte: Date; lte: Date };
    if (mes) {
      const [y, m] = mes.split('-').map(Number);
      const ref = new Date(y, m - 1, 1);
      dateFilter = { gte: startOfMonth(ref), lte: endOfMonth(ref) };
    } else {
      const { start, end } = last6Months();
      dateFilter = { gte: start, lte: end };
    }

    const [receitas, despesas] = await Promise.all([
      prisma.receita.findMany({
        where: { propriedadeId: { in: propIds }, data: dateFilter },
        select: { valor: true, categoria: true, data: true },
      }),
      prisma.despesa.findMany({
        where: { propriedadeId: { in: propIds }, data: dateFilter },
        select: { valor: true, categoria: true, data: true },
      }),
    ]);

    const totalReceitas = receitas.reduce((s, r) => s + r.valor, 0);
    const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);

    // Por categoria
    const catMap = new Map<string, { totalReceitas: number; totalDespesas: number }>();
    for (const r of receitas) {
      const e = catMap.get(r.categoria) ?? { totalReceitas: 0, totalDespesas: 0 };
      e.totalReceitas += r.valor;
      catMap.set(r.categoria, e);
    }
    for (const d of despesas) {
      const e = catMap.get(d.categoria) ?? { totalReceitas: 0, totalDespesas: 0 };
      e.totalDespesas += d.valor;
      catMap.set(d.categoria, e);
    }
    const porCategoria = Array.from(catMap.entries()).map(([categoria, v]) => ({ categoria, ...v }));

    // Evolução mensal — always last 6 months
    const { start: ev6Start } = last6Months();
    const [rec6, desp6] = await Promise.all([
      prisma.receita.findMany({
        where: { propriedadeId: { in: propIds }, data: { gte: ev6Start } },
        select: { valor: true, data: true },
      }),
      prisma.despesa.findMany({
        where: { propriedadeId: { in: propIds }, data: { gte: ev6Start } },
        select: { valor: true, data: true },
      }),
    ]);

    const monthBuckets = new Map<string, { receitas: number; despesas: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.set(mesLabel(d), { receitas: 0, despesas: 0 });
    }
    for (const r of rec6) {
      const key = mesLabel(r.data);
      const b = monthBuckets.get(key);
      if (b) b.receitas += r.valor;
    }
    for (const d of desp6) {
      const key = mesLabel(d.data);
      const b = monthBuckets.get(key);
      if (b) b.despesas += d.valor;
    }
    const evolucaoMensal = Array.from(monthBuckets.entries()).map(([mes, v]) => ({
      mes,
      receitas: v.receitas,
      despesas: v.despesas,
      lucro: v.receitas - v.despesas,
    }));

    return { totalReceitas, totalDespesas, lucroLiquido: totalReceitas - totalDespesas, porCategoria, evolucaoMensal };
  },

  /* ── Relatório Rebanho ────────────────────────────────────────────────── */

  async gerarRelatorioRebanho(produtorId: string) {
    const produtor = await prisma.produtor.findUnique({ where: { id: produtorId }, select: { id: true } });
    if (!produtor) throw new NotFoundError('Produtor');

    const propIds = await getPropIds(produtorId);
    if (propIds.length === 0) {
      return {
        totalAtivos: 0, totalInativos: 0, porEspecie: [],
        custoTotalRebanho: 0, custoPorAnimal: 0, eventosRecentes: [],
      };
    }

    const animais = await prisma.animal.findMany({
      where: { propriedadeId: { in: propIds } },
      select: { id: true, nome: true, especie: true, status: true },
    });

    const animalIds = animais.map((a) => a.id);
    const animalMap = new Map(animais.map((a) => [a.id, a]));

    const eventos = await prisma.animalEvento.findMany({
      where: { animalId: { in: animalIds }, valor: { not: null, gt: 0 } },
      select: { animalId: true, tipo: true, descricao: true, valor: true, data: true },
      orderBy: { data: 'desc' },
    });

    const totalAtivos   = animais.filter((a) => a.status === 'ATIVO').length;
    const totalInativos = animais.length - totalAtivos;

    // Por espécie
    const especieMap = new Map<string, { total: number; custoTotal: number }>();
    for (const a of animais) {
      const e = especieMap.get(a.especie) ?? { total: 0, custoTotal: 0 };
      e.total++;
      especieMap.set(a.especie, e);
    }
    for (const ev of eventos) {
      const animal = animalMap.get(ev.animalId);
      if (!animal) continue;
      const e = especieMap.get(animal.especie)!;
      e.custoTotal += ev.valor ?? 0;
    }
    const porEspecie = Array.from(especieMap.entries()).map(([especie, v]) => ({ especie, ...v }));

    const custoTotalRebanho = eventos.reduce((s, ev) => s + (ev.valor ?? 0), 0);
    const custoPorAnimal    = totalAtivos > 0 ? custoTotalRebanho / totalAtivos : 0;

    const eventosRecentes = eventos.slice(0, 10).map((ev) => ({
      animalNome: animalMap.get(ev.animalId)?.nome ?? null,
      tipo:       ev.tipo,
      descricao:  ev.descricao,
      valor:      ev.valor ?? 0,
      data:       ev.data,
    }));

    return { totalAtivos, totalInativos, porEspecie, custoTotalRebanho, custoPorAnimal, eventosRecentes };
  },
};
