import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useFinanceiroStore } from '../../store/financeiro.store';
import type {
  CreateTransacaoData,
  GraficoMes,
  TransacaoCategoria,
  TransacaoTipo,
} from '../../types';

/* ─── Constants ─────────────────────────────────────────────────────────── */

const CATEGORIAS: Record<TransacaoCategoria, string> = {
  ALIMENTACAO:     'Alimentação',
  SAUDE_ANIMAL:    'Saúde Animal',
  INSUMOS:         'Insumos',
  EQUIPAMENTOS:    'Equipamentos',
  COMBUSTIVEL:     'Combustível',
  MAO_DE_OBRA:     'Mão de Obra',
  VENDA_ANIMAL:    'Venda Animal',
  VENDA_PRODUCAO:  'Venda Produção',
  FINANCIAMENTO:   'Financiamento',
  OUTROS:          'Outros',
};

const CATEGORIA_KEYS = Object.keys(CATEGORIAS) as TransacaoCategoria[];

const MONTHS_LABEL: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

/* ─── Currency & Date ────────────────────────────────────────────────────── */

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

function monthOptions() {
  const opts: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const val = `${d.getFullYear()}-${mm}`;
    opts.push({ value: val, label: `${MONTHS_LABEL[mm]}/${d.getFullYear()}` });
  }
  return opts;
}

/* ─── SVG Bar Chart ─────────────────────────────────────────────────────── */

function BarChart({ data }: { data: GraficoMes[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.receitas, d.despesas]), 1);
  const H = 120;
  const BAR_W = 18;
  const GAP = 6;
  const GROUP = BAR_W * 2 + GAP;
  const SPACING = 14;
  const PAD_L = 8;
  const totalW = data.length * (GROUP + SPACING) + PAD_L;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${H + 36}`}
        style={{ minWidth: `${totalW}px`, height: '160px' }}
        aria-label="Gráfico de receitas e despesas por mês"
      >
        {/* Grid lines */}
        {[0, 0.5, 1].map((r) => (
          <line
            key={r}
            x1={PAD_L}
            y1={H * (1 - r)}
            x2={totalW}
            y2={H * (1 - r)}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}

        {data.map((d, i) => {
          const x = PAD_L + i * (GROUP + SPACING);
          const recH = (d.receitas / maxVal) * H;
          const despH = (d.despesas / maxVal) * H;

          return (
            <g key={i}>
              {/* Receita bar */}
              {recH > 0 && (
                <rect
                  x={x}
                  y={H - recH}
                  width={BAR_W}
                  height={recH}
                  rx="3"
                  fill="#22c55e"
                  opacity="0.85"
                />
              )}
              {/* Despesa bar */}
              {despH > 0 && (
                <rect
                  x={x + BAR_W + GAP}
                  y={H - despH}
                  width={BAR_W}
                  height={despH}
                  rx="3"
                  fill="#f87171"
                  opacity="0.85"
                />
              )}
              {/* Month label */}
              <text
                x={x + GROUP / 2}
                y={H + 16}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="11"
                fontWeight="600"
              >
                {d.mes}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Summary Card ──────────────────────────────────────────────────────── */

interface SummaryCardProps {
  label: string;
  value: number;
  sublabel?: string;
  color: 'green' | 'red' | 'blue' | 'gray';
  loading: boolean;
}

const COLOR_MAP = {
  green: { bg: 'bg-green-50', text: 'text-green-700', sub: 'text-green-500', dot: 'bg-green-500' },
  red:   { bg: 'bg-red-50',   text: 'text-red-700',   sub: 'text-red-400',   dot: 'bg-red-500' },
  blue:  { bg: 'bg-primary-50', text: 'text-primary-700', sub: 'text-primary-500', dot: 'bg-primary-500' },
  gray:  { bg: 'bg-gray-50',  text: 'text-gray-700',  sub: 'text-gray-400',  dot: 'bg-gray-400' },
};

function SummaryCard({ label, value, sublabel, color, loading }: SummaryCardProps) {
  const c = COLOR_MAP[color];
  const isNegative = value < 0;
  const displayColor = color === 'blue' && isNegative ? COLOR_MAP.red : c;

  return (
    <div className={`rounded-2xl p-4 ${displayColor.bg} flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${displayColor.dot}`} />
        <p className={`text-xs font-semibold ${displayColor.sub} uppercase tracking-wide`}>{label}</p>
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className={`text-xl font-bold ${displayColor.text} leading-none`}>{fmt(value)}</p>
      )}
      {sublabel && <p className={`text-[11px] ${displayColor.sub}`}>{sublabel}</p>}
    </div>
  );
}

/* ─── Currency Input ─────────────────────────────────────────────────────── */

function centavosToDisplay(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}

function CurrencyInput({
  centavos,
  onChange,
  hasError,
}: {
  centavos: number;
  onChange: (v: number) => void;
  hasError?: boolean;
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const next = centavos * 10 + parseInt(e.key, 10);
      if (next <= 9_999_999_999) onChange(next); // cap at R$ 99.999.999,99
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      onChange(Math.floor(centavos / 10));
    }
    // ignore everything else (arrows, tab, etc. pass through normally)
  }

  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm font-medium pointer-events-none select-none">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={centavosToDisplay(centavos)}
        onChange={() => {/* controlled via onKeyDown */}}
        onKeyDown={handleKeyDown}
        onPaste={(e) => e.preventDefault()}
        placeholder="0,00"
        className={[
          'w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent caret-transparent',
          hasError ? 'border-red-300 bg-red-50' : 'border-gray-200',
        ].join(' ')}
      />
    </div>
  );
}

/* ─── Add Transaction Form ──────────────────────────────────────────────── */

interface FormState {
  tipo: TransacaoTipo;
  valorCentavos: number;
  descricao: string;
  categoria: TransacaoCategoria;
  data: string;
}

const EMPTY_FORM: FormState = {
  tipo: 'receita',
  valorCentavos: 0,
  descricao: '',
  categoria: 'OUTROS',
  data: new Date().toISOString().split('T')[0],
};

function AddTransacaoForm({
  onClose,
  onSubmit,
  submitting,
}: {
  onClose: () => void;
  onSubmit: (data: CreateTransacaoData) => Promise<void>;
  submitting: boolean;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldError, setFieldError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (form.valorCentavos <= 0) return setFieldError('Informe um valor positivo.');
    if (!form.descricao.trim()) return setFieldError('Descrição é obrigatória.');
    if (!form.data) return setFieldError('Data é obrigatória.');

    await onSubmit({
      tipo: form.tipo,
      descricao: form.descricao.trim(),
      valor: form.valorCentavos / 100,
      data: form.data,
      categoria: form.categoria,
    });
    setForm(EMPTY_FORM);
  }

  const isReceita = form.tipo === 'receita';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Nova Transação</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <IconX />
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-xl">
        {(['receita', 'despesa'] as TransacaoTipo[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set('tipo', t)}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
              form.tipo === t
                ? t === 'receita'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-red-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t === 'receita' ? '+ Receita' : '− Despesa'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Value */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Valor (R$) <span className="text-red-400">*</span>
          </label>
          <CurrencyInput
            centavos={form.valorCentavos}
            onChange={(v) => { setForm((f) => ({ ...f, valorCentavos: v })); setFieldError(null); }}
            hasError={fieldError !== null && form.valorCentavos === 0}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Descrição <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Venda de soja — lote 12"
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            maxLength={200}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            required
          />
        </div>

        {/* Category + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
            <select
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value as TransacaoCategoria)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white"
            >
              {CATEGORIA_KEYS.map((k) => (
                <option key={k} value={k}>{CATEGORIAS[k]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Data <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => set('data', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              required
            />
          </div>
        </div>

        {fieldError && (
          <p className="text-xs text-red-500 font-medium">{fieldError}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={[
              'flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60',
              isReceita ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
            ].join(' ')}
          >
            {submitting ? 'Salvando…' : `Registrar ${isReceita ? 'Receita' : 'Despesa'}`}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Transaction row ────────────────────────────────────────────────────── */

function TransacaoRow({
  tx,
  deleting,
  onDelete,
}: {
  tx: { id: string; tipo: TransacaoTipo; descricao: string; valor: number; data: string; categoria: TransacaoCategoria };
  deleting: boolean;
  onDelete: () => void;
}) {
  const isReceita = tx.tipo === 'receita';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-all ${deleting ? 'opacity-40' : 'border-gray-100'}`}>
      {/* Type indicator */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isReceita ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {isReceita ? '+' : '−'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{tx.descricao}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-gray-400">{fmtDate(tx.data)}</span>
          <span className="text-gray-200">·</span>
          <span className="text-[11px] text-gray-400">{CATEGORIAS[tx.categoria]}</span>
        </div>
      </div>

      {/* Value */}
      <p className={`text-sm font-bold shrink-0 ${isReceita ? 'text-green-600' : 'text-red-500'}`}>
        {isReceita ? '+' : '−'} {fmt(tx.valor)}
      </p>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        title="Excluir transação"
        className="ml-1 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0 disabled:pointer-events-none"
      >
        <IconTrash />
      </button>
    </div>
  );
}

/* ─── Minimal SVG icons ──────────────────────────────────────────────────── */

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="w-3.5 h-3.5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="w-4 h-4">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export function Financeiro() {
  const {
    transacoes, resumo, grafico,
    filters, loading, error, successMessage,
    fetchAll, fetchTransacoes, addTransacao, removeTransacao,
    setFilter, resetFilters, clearMessages,
  } = useFinanceiroStore();

  const [showForm, setShowForm] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    fetchAll();
    initialized.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch transactions when filters change — skip the initial mount
  // (fetchAll already includes fetchTransacoes on first render)
  useEffect(() => {
    if (!initialized.current) return;
    fetchTransacoes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.mes, filters.tipo, filters.categoria]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => clearMessages(), 3000);
    }
  }, [successMessage, clearMessages]);

  async function handleAddTransacao(data: CreateTransacaoData) {
    await addTransacao(data);
    setShowForm(false);
  }

  const monthOpts = monthOptions();
  const isFiltered = filters.mes !== currentMonthValue() || filters.tipo !== 'todos' || filters.categoria !== '';
  const currentMonthLabel = (() => {
    const [, m] = filters.mes.split('-');
    return MONTHS_LABEL[m] ?? filters.mes;
  })();

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-400 text-sm mt-0.5">Controle de receitas, despesas e lucro</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <IconPlus />
          <span className="hidden sm:inline">Nova Transação</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* ── Feedback banners ────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button type="button" onClick={clearMessages} className="text-red-400 hover:text-red-600 ml-3">
            <IconX />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          <button type="button" onClick={clearMessages} className="text-green-400 hover:text-green-600 ml-3">
            <IconX />
          </button>
        </div>
      )}

      {/* ── Add form ────────────────────────────────────────────────── */}
      {showForm && (
        <AddTransacaoForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddTransacao}
          submitting={loading.submitting}
        />
      )}

      {/* ── Summary cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Receitas"
          value={resumo?.totalReceitas ?? 0}
          sublabel="Acumulado geral"
          color="green"
          loading={loading.resumo}
        />
        <SummaryCard
          label="Total Despesas"
          value={resumo?.totalDespesas ?? 0}
          sublabel="Acumulado geral"
          color="red"
          loading={loading.resumo}
        />
        <SummaryCard
          label="Saldo Geral"
          value={resumo?.saldo ?? 0}
          sublabel="Receitas − Despesas"
          color="blue"
          loading={loading.resumo}
        />
        <SummaryCard
          label={`Lucro — ${currentMonthLabel}`}
          value={resumo?.lucroMes ?? 0}
          sublabel={`Rec: ${fmt(resumo?.receitasMes ?? 0)} / Desp: ${fmt(resumo?.despesasMes ?? 0)}`}
          color="gray"
          loading={loading.resumo}
        />
      </div>

      {/* ── Chart ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Receitas vs Despesas</h2>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-500 inline-block" />
              <span className="text-gray-500">Receitas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-400 inline-block" />
              <span className="text-gray-500">Despesas</span>
            </span>
          </div>
        </div>
        {loading.grafico ? (
          <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
        ) : grafico.length > 0 ? (
          <BarChart data={grafico} />
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">
            Sem dados para exibir
          </div>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
            <IconFilter />
            Filtros
          </span>

          {/* Month */}
          <select
            value={filters.mes}
            onChange={(e) => setFilter('mes', e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">Todos os meses</option>
            {monthOpts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Type */}
          {(['todos', 'receita', 'despesa'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter('tipo', t)}
              className={[
                'px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all',
                filters.tipo === t
                  ? t === 'receita'
                    ? 'bg-green-100 border-green-200 text-green-700'
                    : t === 'despesa'
                    ? 'bg-red-100 border-red-200 text-red-700'
                    : 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
              ].join(' ')}
            >
              {t === 'todos' ? 'Todos' : t === 'receita' ? '+ Receitas' : '− Despesas'}
            </button>
          ))}

          {/* Category */}
          <select
            value={filters.categoria}
            onChange={(e) => setFilter('categoria', e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIA_KEYS.map((k) => (
              <option key={k} value={k}>{CATEGORIAS[k]}</option>
            ))}
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Transaction list ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">
            Transações
            {transacoes.length > 0 && (
              <span className="ml-2 text-xs font-semibold text-gray-400">({transacoes.length})</span>
            )}
          </h2>
        </div>

        {loading.transacoes && transacoes.length === 0 ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : transacoes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card flex flex-col items-center gap-4 py-14 text-center">
            <span className="text-5xl">📊</span>
            <div>
              <p className="font-semibold text-gray-700">Nenhuma transação encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                {isFiltered
                  ? 'Tente ajustar os filtros acima'
                  : 'Clique em "Nova Transação" para começar'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {transacoes.map((tx) => (
              <TransacaoRow
                key={tx.id}
                tx={tx}
                deleting={loading.deleting === tx.id}
                onDelete={() => removeTransacao(tx.id, tx.tipo)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
