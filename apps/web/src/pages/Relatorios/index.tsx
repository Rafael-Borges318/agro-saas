import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { api } from '../../services/api';

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

/* ─── PDF helpers ────────────────────────────────────────────────────────── */

function pdfHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFontSize(18);
  doc.setTextColor(30, 80, 160);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(subtitle, 14, 28);
  doc.setTextColor(0, 0, 0);
  doc.line(14, 32, 196, 32);
  return 38;
}

function pdfSummaryCards(
  doc: jsPDF,
  y: number,
  cards: { label: string; value: string }[],
): number {
  doc.setFontSize(9);
  const colW = 55;
  cards.forEach((c, i) => {
    const x = 14 + i * (colW + 5);
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(x, y, colW, 18, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(c.label, x + 4, y + 6);
    doc.setFontSize(10);
    doc.setTextColor(30, 80, 160);
    doc.text(c.value, x + 4, y + 14);
  });
  doc.setTextColor(0, 0, 0);
  return y + 26;
}

function pdfTableHeader(doc: jsPDF, y: number, cols: string[], colWidths: number[]) {
  doc.setFillColor(30, 80, 160);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  let x = 14;
  doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), 7, 'F');
  cols.forEach((col, i) => {
    doc.text(col, x + 2, y + 5);
    x += colWidths[i];
  });
  doc.setTextColor(0, 0, 0);
  return y + 7;
}

function pdfTableRow(
  doc: jsPDF,
  y: number,
  cells: string[],
  colWidths: number[],
  odd: boolean,
) {
  if (odd) {
    doc.setFillColor(248, 250, 255);
    doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), 6, 'F');
  }
  doc.setFontSize(8);
  let x = 14;
  cells.forEach((cell, i) => {
    doc.text(cell, x + 2, y + 4.5);
    x += colWidths[i];
  });
  return y + 6;
}

/* ─── Summary Card ───────────────────────────────────────────────────────── */

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

/* ─── Aba Financeiro ─────────────────────────────────────────────────────── */

function AbaFinanceiro() {
  const [mes, setMes]           = useState(currentMonth());
  const [data, setData]         = useState<RelatorioFinanceiro | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get<{ status: string; data: RelatorioFinanceiro }>('/relatorios/financeiro', { params: { mes } })
      .then((r) => setData(r.data.data))
      .catch(() => setError('Erro ao carregar relatório financeiro.'))
      .finally(() => setLoading(false));
  }, [mes]);

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    let y = pdfHeader(doc, 'Relatório Financeiro — Agro Controle', `Período: ${mes}`);

    y = pdfSummaryCards(doc, y, [
      { label: 'Total Receitas', value: fmt(data.totalReceitas) },
      { label: 'Total Despesas', value: fmt(data.totalDespesas) },
      { label: 'Lucro Líquido',  value: fmt(data.lucroLiquido)  },
    ]);

    doc.setFontSize(10);
    doc.setTextColor(30, 80, 160);
    doc.text('Detalhamento por Categoria', 14, y);
    y += 4;

    const colWidths = [80, 50, 50];
    y = pdfTableHeader(doc, y, ['Categoria', 'Receitas', 'Despesas'], colWidths);
    data.porCategoria.forEach((row, i) => {
      y = pdfTableRow(
        doc, y,
        [CATEGORIA_LABELS[row.categoria] ?? row.categoria, fmt(row.totalReceitas), fmt(row.totalDespesas)],
        colWidths, i % 2 === 0,
      );
    });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
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

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {data && !loading && (
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
              <p className="text-gray-400 text-sm text-center py-6">Nenhum lançamento no período.</p>
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
  const [error, setError]     = useState('');

  useEffect(() => {
    api
      .get<{ status: string; data: RelatorioRebanho }>('/relatorios/rebanho')
      .then((r) => setData(r.data.data))
      .catch(() => setError('Erro ao carregar relatório do rebanho.'))
      .finally(() => setLoading(false));
  }, []);

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    let y = pdfHeader(
      doc,
      'Relatório do Rebanho — Agro Controle',
      `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    );

    y = pdfSummaryCards(doc, y, [
      { label: 'Animais Ativos',       value: String(data.totalAtivos) },
      { label: 'Custo Total Rebanho',  value: fmt(data.custoTotalRebanho) },
      { label: 'Custo Médio/Animal',   value: fmt(data.custoPorAnimal) },
    ]);

    doc.setFontSize(10);
    doc.setTextColor(30, 80, 160);
    doc.text('Por Espécie', 14, y);
    y += 4;

    const colEsp = [60, 40, 80];
    y = pdfTableHeader(doc, y, ['Espécie', 'Total', 'Custo Total'], colEsp);
    data.porEspecie.forEach((row, i) => {
      y = pdfTableRow(
        doc, y,
        [ESPECIE_LABELS[row.especie] ?? row.especie, String(row.total), fmt(row.custoTotal)],
        colEsp, i % 2 === 0,
      );
    });

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(30, 80, 160);
    doc.text('Eventos Recentes com Custo', 14, y);
    y += 4;

    const colEv = [40, 30, 70, 30, 22];
    y = pdfTableHeader(doc, y, ['Animal', 'Tipo', 'Descrição', 'Valor', 'Data'], colEv);
    data.eventosRecentes.forEach((ev, i) => {
      y = pdfTableRow(
        doc, y,
        [
          ev.animalNome ?? '—',
          EVENTO_LABELS[ev.tipo] ?? ev.tipo,
          ev.descricao.slice(0, 28),
          fmt(ev.valor),
          fmtDate(ev.data),
        ],
        colEv, i % 2 === 0,
      );
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
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

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {data && !loading && (
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
              <p className="text-gray-400 text-sm text-center py-6">Nenhum animal cadastrado.</p>
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
              <p className="text-gray-400 text-sm text-center py-6">Nenhum evento com custo registrado.</p>
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
  const [tab, setTab] = useState<Tab>('financeiro');

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
