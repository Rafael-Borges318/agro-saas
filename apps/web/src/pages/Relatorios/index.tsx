import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { AxiosError } from 'axios';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface RelatorioFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
  porCategoria: { categoria: string; totalReceitas: number; totalDespesas: number }[];
  evolucaoMensal: { mes: string; receitas: number; despesas: number; lucro: number }[];
}

interface RelatorioRebanho {
  totalAtivos: number;
  totalInativos: number;
  porEspecie: { especie: string; total: number; custoTotal: number }[];
  custoTotalRebanho: number;
  custoPorAnimal: number;
  eventosRecentes: {
    animalNome: string | null;
    tipo: string;
    descricao: string;
    valor: number;
    data: string;
  }[];
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const CATEGORIA_LABELS: Record<string, string> = {
  ALIMENTACAO:    'Alimentação',
  SAUDE_ANIMAL:   'Saúde Animal',
  INSUMOS:        'Insumos',
  EQUIPAMENTOS:   'Equipamentos',
  COMBUSTIVEL:    'Combustível',
  MAO_DE_OBRA:    'Mão de Obra',
  VENDA_ANIMAL:   'Venda Animal',
  VENDA_PRODUCAO: 'Venda Produção',
  FINANCIAMENTO:  'Financiamento',
  OUTROS:         'Outros',
};

const ESPECIE_LABELS: Record<string, string> = {
  BOVINO:  'Bovino',
  SUINO:   'Suíno',
  AVICOLA: 'Avícola',
  OVINO:   'Ovino',
  CAPRINO: 'Caprino',
  EQUINO:  'Equino',
  OUTRO:   'Outro',
};

const EVENTO_LABELS: Record<string, string> = {
  PESAGEM:    'Pesagem',
  VACINACAO:  'Vacinação',
  VENDA:      'Venda',
  DOENCA:     'Doença',
  REPRODUCAO: 'Reprodução',
  OBSERVACAO: 'Observação',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR');
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function extractErrorMessage(err: unknown): { message: string; is403: boolean } {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const msg = (err.response?.data as { message?: string })?.message ?? err.message;
    return { message: msg, is403: status === 403 };
  }
  return { message: 'Erro desconhecido', is403: false };
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SummaryCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: 'green' | 'red' | 'blue';
  sub?: string;
}) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red:   'bg-red-50 border-red-200 text-red-700',
    blue:  'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`card border ${colors[color]} flex flex-col gap-1`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function ErrorCard({ message, is403 }: { message: string; is403: boolean }) {
  return (
    <div className="card bg-red-50 border border-red-200 text-red-700 text-sm space-y-1">
      {is403 ? (
        <>
          <p className="font-semibold">Perfil de produtor não encontrado</p>
          <p className="text-xs opacity-80">Conclua o onboarding para acessar os relatórios. Certifique-se de ter cadastrado uma propriedade.</p>
        </>
      ) : (
        <>
          <p className="font-semibold">Erro ao carregar relatório</p>
          <p className="text-xs opacity-80">{message}</p>
        </>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card h-24 animate-pulse bg-gray-100" />
      ))}
    </div>
  );
}

/* ─── Aba Financeiro ─────────────────────────────────────────────────────── */

function AbaFinanceiro() {
  const [mes, setMes]         = useState(currentMonth());
  const [data, setData]       = useState<RelatorioFinanceiro | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<{ message: string; is403: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);
    console.log('[Relatorios] Buscando financeiro, mês:', mes);
    api
      .get<{ status: string; data: RelatorioFinanceiro }>('/relatorios/financeiro', { params: { mes } })
      .then((r) => {
        console.log('[Relatorios] Resposta financeiro:', r.data.data);
        setData(r.data.data);
      })
      .catch((err) => {
        const parsed = extractErrorMessage(err);
        console.error('[Relatorios] Erro financeiro:', parsed);
        setError(parsed);
      })
      .finally(() => setLoading(false));
  }, [mes]);

  const exportPDF = async () => {
    if (!data) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 80, 160);
    doc.text('Relatório Financeiro — Agro Controle', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${mes}`, 14, 28);
    doc.setTextColor(0, 0, 0);
    doc.line(14, 32, 196, 32);

    let y = 42;
    doc.setFontSize(10);
    doc.text(`Total Receitas: ${fmt(data.totalReceitas)}`, 14, y); y += 7;
    doc.text(`Total Despesas: ${fmt(data.totalDespesas)}`, 14, y); y += 7;
    doc.text(`Lucro Líquido:  ${fmt(data.lucroLiquido)}`,  14, y); y += 12;

    doc.setFontSize(11);
    doc.setTextColor(30, 80, 160);
    doc.text('Por Categoria', 14, y); y += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    for (const row of data.porCategoria) {
      doc.text(`${CATEGORIA_LABELS[row.categoria] ?? row.categoria}`, 14, y);
      doc.text(`Rec: ${fmt(row.totalReceitas)}  Desp: ${fmt(row.totalDespesas)}`, 80, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    }

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} — Agro Controle`, 14, 290);
    doc.save(`relatorio-financeiro-${mes}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="label">Mês de referência</label>
          <input
            type="month"
            className="input w-44"
            value={mes}
            max={currentMonth()}
            onChange={(e) => setMes(e.target.value)}
          />
        </div>
        <button
          onClick={exportPDF}
          disabled={!data || loading}
          className="btn-secondary flex items-center gap-2 mt-5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9"  y1="15" x2="15" y2="15" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {loading && <SkeletonGrid />}

      {error && <ErrorCard {...error} />}

      {data && !loading && !error && (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label="Total Receitas" value={fmt(data.totalReceitas)} color="green" />
            <SummaryCard label="Total Despesas" value={fmt(data.totalDespesas)} color="red" />
            <SummaryCard
              label="Lucro Líquido"
              value={fmt(data.lucroLiquido)}
              color={data.lucroLiquido >= 0 ? 'blue' : 'red'}
            />
          </div>

          {/* Evolução mensal */}
          {data.evolucaoMensal.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Evolução dos últimos 6 meses</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-2 text-gray-500 font-medium">Mês</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Receitas</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Despesas</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.evolucaoMensal.map((row) => (
                      <tr key={row.mes} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-700">{row.mes}</td>
                        <td className="py-2 text-right text-green-700">{fmt(row.receitas)}</td>
                        <td className="py-2 text-right text-red-700">{fmt(row.despesas)}</td>
                        <td className={`py-2 text-right font-semibold ${row.lucro >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                          {fmt(row.lucro)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Por categoria */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Por categoria</h3>
            {data.porCategoria.length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <p className="text-gray-500 text-sm">Nenhum lançamento no período selecionado.</p>
                <p className="text-gray-400 text-xs">Registre receitas e despesas no módulo Financeiro.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-2 text-gray-500 font-medium">Categoria</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Receitas</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Despesas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.porCategoria.map((row) => (
                      <tr key={row.categoria} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-700">
                          {CATEGORIA_LABELS[row.categoria] ?? row.categoria}
                        </td>
                        <td className="py-2 text-right text-green-700">{fmt(row.totalReceitas)}</td>
                        <td className="py-2 text-right text-red-700">{fmt(row.totalDespesas)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Aba Rebanho ────────────────────────────────────────────────────────── */

function AbaRebanho() {
  const [data, setData]       = useState<RelatorioRebanho | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<{ message: string; is403: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log('[Relatorios] Buscando rebanho...');
    api
      .get<{ status: string; data: RelatorioRebanho }>('/relatorios/rebanho')
      .then((r) => {
        console.log('[Relatorios] Resposta rebanho:', r.data.data);
        setData(r.data.data);
      })
      .catch((err) => {
        const parsed = extractErrorMessage(err);
        console.error('[Relatorios] Erro rebanho:', parsed);
        setError(parsed);
      })
      .finally(() => setLoading(false));
  }, []);

  const exportPDF = async () => {
    if (!data) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 80, 160);
    doc.text('Relatório do Rebanho — Agro Controle', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
    doc.setTextColor(0, 0, 0);
    doc.line(14, 32, 196, 32);

    let y = 42;
    doc.text(`Animais Ativos: ${data.totalAtivos}`, 14, y); y += 7;
    doc.text(`Custo Total: ${fmt(data.custoTotalRebanho)}`, 14, y); y += 7;
    doc.text(`Custo Médio/Animal: ${fmt(data.custoPorAnimal)}`, 14, y); y += 12;

    doc.setFontSize(11);
    doc.setTextColor(30, 80, 160);
    doc.text('Por Espécie', 14, y); y += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    for (const row of data.porEspecie) {
      doc.text(`${ESPECIE_LABELS[row.especie] ?? row.especie}: ${row.total} animais — ${fmt(row.custoTotal)}`, 14, y);
      y += 6;
    }

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} — Agro Controle`, 14, 290);
    doc.save(`relatorio-rebanho-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={exportPDF}
          disabled={!data || loading}
          className="btn-secondary flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9"  y1="15" x2="15" y2="15" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {loading && <SkeletonGrid />}

      {error && <ErrorCard {...error} />}

      {data && !loading && !error && (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Animais Ativos"
              value={String(data.totalAtivos)}
              color="green"
              sub={`${data.totalInativos} inativos`}
            />
            <SummaryCard label="Custo Total do Rebanho" value={fmt(data.custoTotalRebanho)} color="red" />
            <SummaryCard label="Custo Médio por Animal"  value={fmt(data.custoPorAnimal)}    color="blue" />
          </div>

          {/* Por espécie */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Por espécie</h3>
            {data.porEspecie.length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <p className="text-gray-500 text-sm">Nenhum animal cadastrado.</p>
                <p className="text-gray-400 text-xs">Cadastre animais no módulo Rebanho.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-2 text-gray-500 font-medium">Espécie</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Total</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.porEspecie.map((row) => (
                      <tr key={row.especie} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-700">{ESPECIE_LABELS[row.especie] ?? row.especie}</td>
                        <td className="py-2 text-right font-semibold text-gray-900">{row.total}</td>
                        <td className="py-2 text-right text-red-700">{fmt(row.custoTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Eventos recentes */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">
              Eventos recentes com custo
              <span className="text-gray-400 font-normal text-xs ml-2">(últimos 10)</span>
            </h3>
            {data.eventosRecentes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">Nenhum evento com custo registrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-2 text-gray-500 font-medium">Animal</th>
                      <th className="text-left pb-2 text-gray-500 font-medium">Tipo</th>
                      <th className="text-left pb-2 text-gray-500 font-medium">Descrição</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Valor</th>
                      <th className="text-right pb-2 text-gray-500 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.eventosRecentes.map((ev, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-700">{ev.animalNome ?? <span className="text-gray-400">—</span>}</td>
                        <td className="py-2 text-gray-600">{EVENTO_LABELS[ev.tipo] ?? ev.tipo}</td>
                        <td className="py-2 text-gray-600 max-w-xs truncate">{ev.descricao}</td>
                        <td className="py-2 text-right text-red-700 font-medium">{fmt(ev.valor)}</td>
                        <td className="py-2 text-right text-gray-500">{fmtDate(ev.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Page Root ──────────────────────────────────────────────────────────── */

type Tab = 'financeiro' | 'rebanho';

export function Relatorios() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'rebanho' ? 'rebanho' : 'financeiro';
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-0.5">Análise financeira e de rebanho da sua propriedade</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([
          { id: 'financeiro' as Tab, label: 'Financeiro' },
          { id: 'rebanho'    as Tab, label: 'Rebanho'    },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'financeiro' && <AbaFinanceiro />}
      {tab === 'rebanho'    && <AbaRebanho />}
    </div>
  );
}
