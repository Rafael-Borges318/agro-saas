import { useEffect, useState, useCallback, useRef } from 'react';
import { precosService } from '../../services/precos.service';
import type { MonthlyPrice } from '../../services/precos.service';
import type { PrecoAgricola } from '../../types';
import type { AxiosError } from 'axios';

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function IconArrowUp({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
function IconArrowDown({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  );
}
function IconRefresh({ spinning }: { spinning: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={['w-4 h-4', spinning ? 'animate-spin' : ''].join(' ')}>
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatBRLShort(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (value < 10)    return value.toFixed(2);
  return value.toFixed(0);
}

/* ─── Commodity metadata (all 27) ───────────────────────────────────────── */
const COMMODITY_META: Record<string, { emoji: string; cor: string; bg: string; ring: string; tipo: 'Vegetal' | 'Animal' }> = {
  // Vegetal
  'Soja':             { emoji: '🌱', cor: 'text-emerald-700', bg: 'bg-emerald-50',  ring: 'ring-emerald-200', tipo: 'Vegetal' },
  'Milho':            { emoji: '🌽', cor: 'text-yellow-700',  bg: 'bg-yellow-50',   ring: 'ring-yellow-200',  tipo: 'Vegetal' },
  'Arroz':            { emoji: '🌾', cor: 'text-stone-700',   bg: 'bg-stone-50',    ring: 'ring-stone-200',   tipo: 'Vegetal' },
  'Trigo':            { emoji: '🌾', cor: 'text-amber-700',   bg: 'bg-amber-50',    ring: 'ring-amber-200',   tipo: 'Vegetal' },
  'Feijão':           { emoji: '🫘', cor: 'text-red-700',     bg: 'bg-red-50',      ring: 'ring-red-200',     tipo: 'Vegetal' },
  'Café':             { emoji: '☕', cor: 'text-orange-800',  bg: 'bg-orange-50',   ring: 'ring-orange-200',  tipo: 'Vegetal' },
  'Algodão':          { emoji: '🤍', cor: 'text-blue-700',    bg: 'bg-blue-50',     ring: 'ring-blue-200',    tipo: 'Vegetal' },
  'Cana-de-açúcar':   { emoji: '🎋', cor: 'text-lime-700',    bg: 'bg-lime-50',     ring: 'ring-lime-200',    tipo: 'Vegetal' },
  'Sorgo':            { emoji: '🌾', cor: 'text-yellow-600',  bg: 'bg-yellow-50',   ring: 'ring-yellow-100',  tipo: 'Vegetal' },
  'Mandioca':         { emoji: '🥔', cor: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'ring-amber-100',   tipo: 'Vegetal' },
  'Hortaliças':       { emoji: '🥬', cor: 'text-green-700',   bg: 'bg-green-50',    ring: 'ring-green-200',   tipo: 'Vegetal' },
  'Frutas':           { emoji: '🍎', cor: 'text-red-600',     bg: 'bg-red-50',      ring: 'ring-red-100',     tipo: 'Vegetal' },
  'Uva':              { emoji: '🍇', cor: 'text-purple-700',  bg: 'bg-purple-50',   ring: 'ring-purple-200',  tipo: 'Vegetal' },
  'Maçã':             { emoji: '🍏', cor: 'text-rose-600',    bg: 'bg-rose-50',     ring: 'ring-rose-200',    tipo: 'Vegetal' },
  'Fumo':             { emoji: '🌿', cor: 'text-teal-700',    bg: 'bg-teal-50',     ring: 'ring-teal-200',    tipo: 'Vegetal' },
  'Pastagem':         { emoji: '🌿', cor: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'ring-emerald-100', tipo: 'Vegetal' },
  'Silagem':          { emoji: '🌾', cor: 'text-lime-800',    bg: 'bg-lime-50',     ring: 'ring-lime-100',    tipo: 'Vegetal' },
  'Reflorestamento':  { emoji: '🌳', cor: 'text-green-800',   bg: 'bg-green-50',    ring: 'ring-green-200',   tipo: 'Vegetal' },
  // Animal
  'Bovinos de corte': { emoji: '🐂', cor: 'text-red-800',     bg: 'bg-red-50',      ring: 'ring-red-200',     tipo: 'Animal' },
  'Bovinos de leite': { emoji: '🐄', cor: 'text-sky-700',     bg: 'bg-sky-50',      ring: 'ring-sky-200',     tipo: 'Animal' },
  'Suínos':           { emoji: '🐖', cor: 'text-pink-700',    bg: 'bg-pink-50',     ring: 'ring-pink-200',    tipo: 'Animal' },
  'Aves':             { emoji: '🐔', cor: 'text-orange-600',  bg: 'bg-orange-50',   ring: 'ring-orange-100',  tipo: 'Animal' },
  'Ovinos':           { emoji: '🐑', cor: 'text-slate-700',   bg: 'bg-slate-50',    ring: 'ring-slate-200',   tipo: 'Animal' },
  'Caprinos':         { emoji: '🐐', cor: 'text-stone-700',   bg: 'bg-stone-50',    ring: 'ring-stone-200',   tipo: 'Animal' },
  'Equinos':          { emoji: '🐎', cor: 'text-amber-800',   bg: 'bg-amber-50',    ring: 'ring-amber-200',   tipo: 'Animal' },
  'Piscicultura':     { emoji: '🐟', cor: 'text-blue-600',    bg: 'bg-blue-50',     ring: 'ring-blue-200',    tipo: 'Animal' },
  'Apicultura':       { emoji: '🍯', cor: 'text-yellow-700',  bg: 'bg-yellow-50',   ring: 'ring-yellow-200',  tipo: 'Animal' },
};

function meta(produto: string) {
  return COMMODITY_META[produto] ?? { emoji: '📦', cor: 'text-gray-700', bg: 'bg-gray-50', ring: 'ring-gray-200', tipo: 'Vegetal' as const };
}

/* ─── Seasonal analysis (editorial, covers main commodities) ─────────────── */
const SEASONAL: Record<string, { melhor: string; melhorDesc: string; baixa: string; baixaDesc: string; estrategia: string }> = {
  'Soja': {
    melhor: 'Abril — Maio', melhorDesc: 'Pós-colheita com alta demanda da indústria esmagadora e exportadores.',
    baixa: 'Outubro — Novembro', baixaDesc: 'Safra nova prestes a entrar no mercado pressiona os preços.',
    estrategia: 'Venda 60% na alta (Abr–Mai) e armazene o restante. Quando o preço está 4%+ acima da média histórica, é sinal forte de venda.',
  },
  'Milho': {
    melhor: 'Janeiro — Fevereiro', melhorDesc: 'Entressafra com estoques baixos e demanda da indústria de rações.',
    baixa: 'Abril — Maio', baixaDesc: 'Colheita da safrinha (75% da produção) pressiona os preços.',
    estrategia: 'Contratos futuros antecipados reduzem risco. O milho safrinha domina a oferta — monitore a janela de colheita no Centro-Oeste.',
  },
  'Trigo': {
    melhor: 'Julho — Agosto', melhorDesc: 'Entressafra com estoques curtos e demanda da indústria moageira.',
    baixa: 'Outubro — Novembro', baixaDesc: 'Colheita plena no Paraná e Rio Grande do Sul.',
    estrategia: 'Fixe preço antes da colheita via contratos. A paridade de importação Argentina influencia fortemente o mercado brasileiro.',
  },
  'Café': {
    melhor: 'Maio — Julho', melhorDesc: 'Alta demanda internacional coincide com período de colheita em Minas Gerais.',
    baixa: 'Setembro — Outubro', baixaDesc: 'Excesso de oferta pós-colheita e realização de lucros pelos exportadores.',
    estrategia: 'O câmbio tem peso decisivo: dólar alto favorece a exportação. Em anos de bienalidade negativa, preços sobem — fique atento ao ciclo.',
  },
  'Arroz': {
    melhor: 'Junho — Agosto', melhorDesc: 'Entressafra no Rio Grande do Sul com estoques mais curtos.',
    baixa: 'Março — Abril', baixaDesc: 'Safra nova do RS (70% da produção nacional) pressiona os preços.',
    estrategia: 'Monitore condições climáticas do RS — El Niño e La Niña afetam diretamente a produção. Armazenagem de 3–4 meses costuma ser rentável.',
  },
  'Feijão': {
    melhor: 'Fevereiro — Março', melhorDesc: 'Estoques curtos no intervalo entre as safras das águas e da seca.',
    baixa: 'Maio — Junho', baixaDesc: 'Colheita da safra da seca amplia a oferta no mercado.',
    estrategia: 'Feijão tem alta volatilidade e ciclo curto. Venda imediata após colheita evita risco de preço — armazenagem prolongada exige hedge.',
  },
  'Cana-de-açúcar': {
    melhor: 'Julho — Setembro', melhorDesc: 'Pico de processamento nas usinas e ATR mais alto da cana.',
    baixa: 'Janeiro — Fevereiro', baixaDesc: 'Período de entressafra com menor oferta de cana e incerteza sobre início da safra.',
    estrategia: 'A paridade açúcar/etanol define a melhor destinação. Acompanhe o mercado de combustíveis para maximizar receita por tonelada.',
  },
  'Algodão': {
    melhor: 'Setembro — Outubro', melhorDesc: 'Demanda da indústria têxtil global e estoques curtos no Hemisfério Norte.',
    baixa: 'Abril — Maio', baixaDesc: 'Colheita em Mato Grosso aumenta a oferta disponível.',
    estrategia: 'O mercado de algodão é dolarizado — câmbio e ICE Cotton são as principais referências. Contratos de longo prazo com fiações são essenciais.',
  },
  'Bovinos de corte': {
    melhor: 'Março — Maio', melhorDesc: 'Menor disponibilidade de bois terminados e demanda de Semana Santa.',
    baixa: 'Agosto — Setembro', baixaDesc: 'Pico de abates e oferta elevada de bois terminados do período seco.',
    estrategia: 'Confinamento estratégico para capturar a alta de Abr–Mai. Monitore a relação boi/milho — quando abaixo de 4:1, o confinamento não remunera.',
  },
  'Bovinos de leite': {
    melhor: 'Maio — Julho', melhorDesc: 'Período seco reduz produção e eleva o preço ao produtor.',
    baixa: 'Outubro — Dezembro', baixaDesc: 'Flush do leite com pastagens de verão aumenta a produção e pressiona preços.',
    estrategia: 'Contratos de fornecimento com laticínios garantem preço mínimo. Gestão do rebanho para produção no período seco aumenta receita/vaca.',
  },
  'Suínos': {
    melhor: 'Novembro — Janeiro', melhorDesc: 'Alta demanda de carne suína nas festas de fim de ano.',
    baixa: 'Maio — Julho', baixaDesc: 'Menor consumo no inverno e abates em alta.',
    estrategia: 'Integração com agroindústria garante preço e reduz risco. Custo do milho e farelo de soja representa ~70% do custo de produção.',
  },
  'Aves': {
    melhor: 'Outubro — Dezembro', melhorDesc: 'Alta demanda do mercado interno e exportações aquecidas.',
    baixa: 'Abril — Junho', baixaDesc: 'Menor consumo e maior oferta de frango pós-Páscoa.',
    estrategia: 'O frango é uma das proteínas mais competitivas. Produção integrada com grandes processadores oferece maior estabilidade de preço.',
  },
  default: {
    melhor: 'Consulte o calendário agrícola', melhorDesc: 'Análise sazonal detalhada em desenvolvimento.',
    baixa: 'Consulte o calendário agrícola', baixaDesc: 'Análise sazonal detalhada em desenvolvimento.',
    estrategia: 'Acompanhe as cotações históricas nesta página para identificar padrões sazonais. Use o seletor de anos para comparar diferentes safras.',
  },
};

function getSeasonal(produto: string) {
  return SEASONAL[produto] ?? SEASONAL.default;
}

/* ─── Premium SVG Line Chart (Catmull-Rom + hover tooltip) ──────────────── */
interface ChartProps {
  points: MonthlyPrice[];
  color?: string;
  height?: number;
}

function PremiumLineChart({ points, color = '#3b82f6', height = 200 }: ChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const valid = points.filter((p) => p.preco !== null) as (MonthlyPrice & { preco: number })[];
  if (valid.length < 2) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
        Dados insuficientes para o gráfico
      </div>
    );
  }

  const PAD = { left: 52, right: 18, top: 16, bottom: 32 };
  const VW = 800;
  const VH = height;
  const CW = VW - PAD.left - PAD.right;
  const CH = VH - PAD.top - PAD.bottom;

  const values  = valid.map((p) => p.preco);
  const minVal  = Math.min(...values);
  const maxVal  = Math.max(...values);
  const range   = maxVal - minVal || 1;
  const yMin    = minVal - range * 0.12;
  const yMax    = maxVal + range * 0.12;
  const yRange  = yMax - yMin;

  function xOf(i: number) { return PAD.left + (i / (valid.length - 1)) * CW; }
  function yOf(v: number)  { return PAD.top + CH - ((v - yMin) / yRange) * CH; }

  const pts = valid.map((p, i) => ({ x: xOf(i), y: yOf(p.preco) }));

  function catmullRom(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return '';
    const d: string[] = [`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d.push(`C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`);
    }
    return d.join(' ');
  }

  const linePath = catmullRom(pts);
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + CH).toFixed(1)}` +
    ` L ${PAD.left.toFixed(1)} ${(PAD.top + CH).toFixed(1)} Z`;

  const gradId = `crm-${color.replace('#', '')}`;

  // 4 evenly spaced Y grid ticks
  const yTicks = Array.from({ length: 4 }, (_, i) => yMin + (yRange * (i + 0.75)) / 4);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect  = svgRef.current.getBoundingClientRect();
    const svgX  = ((e.clientX - rect.left) / rect.width) * VW;
    let best = 0;
    let bestDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - svgX);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setHovered(best);
  }

  const hovP  = hovered !== null ? pts[hovered] : null;
  const hovD  = hovered !== null ? valid[hovered] : null;

  // Tooltip anchor so it doesn't overflow
  const tooltipW = 110;
  let tooltipLeft = hovP ? hovP.x - tooltipW / 2 : 0;
  if (hovP && hovP.x > VW * 0.75) tooltipLeft = hovP.x - tooltipW;
  if (hovP && hovP.x < VW * 0.25) tooltipLeft = hovP.x;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      className="w-full cursor-crosshair"
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Y grid */}
      {yTicks.map((tick, ti) => {
        const y = yOf(tick).toFixed(1);
        return (
          <g key={ti}>
            <line x1={PAD.left} y1={y} x2={VW - PAD.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.left - 5} y={y} dominantBaseline="middle" textAnchor="end" fontSize="10" fill="#94a3b8">
              {formatBRLShort(tick)}
            </text>
          </g>
        );
      })}

      {/* Area + line */}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* X-axis month labels */}
      {valid.map((p, i) => (
        <text key={i} x={xOf(i).toFixed(1)} y={VH - 5} textAnchor="middle" fontSize="11" fill="#94a3b8">
          {p.monthName}
        </text>
      ))}

      {/* Endpoint dots */}
      {hovered !== 0 && (
        <circle cx={pts[0].x} cy={pts[0].y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
      )}
      {hovered !== valid.length - 1 && (
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill={color} stroke="white" strokeWidth="2" />
      )}

      {/* Hover crosshair + tooltip */}
      {hovP && hovD && (
        <>
          <line x1={hovP.x} y1={PAD.top} x2={hovP.x} y2={PAD.top + CH}
            stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
          <circle cx={hovP.x} cy={hovP.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />

          {/* Tooltip box */}
          <rect x={tooltipLeft} y={hovP.y - 50} width={tooltipW} height="40"
            rx="6" fill="#1e293b" opacity="0.93" />
          <text x={tooltipLeft + tooltipW / 2} y={hovP.y - 34} textAnchor="middle" fontSize="10" fill="#94a3b8">
            {hovD.monthName} {hovD.year}
          </text>
          <text x={tooltipLeft + tooltipW / 2} y={hovP.y - 19} textAnchor="middle" fontSize="12" fontWeight="700" fill="white">
            R$ {formatBRL(hovD.preco)}
          </text>
        </>
      )}
    </svg>
  );
}

/* ─── Commodity Card ─────────────────────────────────────────────────────── */
function CommodityCard({
  preco, selected, onSelect,
}: { preco: PrecoAgricola; selected: boolean; onSelect: () => void }) {
  const { emoji, bg, cor, ring } = meta(preco.produto);
  const isUp = preco.variacaoPct > 0;

  return (
    <button
      onClick={onSelect}
      className={[
        'w-full text-left bg-white rounded-2xl border p-4 transition-all duration-150 hover:shadow-md',
        selected
          ? `border-primary-300 shadow-md ring-2 ${ring}`
          : 'border-gray-100 shadow-card hover:border-gray-200',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={['w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0', bg].join(' ')}>
            {emoji}
          </div>
          <div className="min-w-0">
            <p className={['text-sm font-bold truncate', cor].join(' ')}>{preco.produto}</p>
            <p className="text-[10px] text-gray-400">{preco.estado ?? 'BR'}</p>
          </div>
        </div>
        <div className="shrink-0">
          {preco.variacaoPct !== 0 ? (
            <div className={['inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg',
              isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'].join(' ')}>
              {isUp ? <IconArrowUp /> : <IconArrowDown />}
              {isUp ? '+' : ''}{preco.variacaoPct.toFixed(2)}%
            </div>
          ) : (
            <span className="text-[10px] text-gray-300 font-medium">estável</span>
          )}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">R$ {formatBRL(preco.preco)}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">por {preco.unidade}</p>
    </button>
  );
}

/* ─── Available years for the chart picker ───────────────────────────────── */
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2022 + 1 }, (_, i) => 2022 + i);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function Precos() {
  const [precos,       setPrecos]       = useState<PrecoAgricola[]>([]);
  const [historico,    setHistorico]    = useState<MonthlyPrice[]>([]);
  const [selected,     setSelected]     = useState<string>('Soja');
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState<'Todos' | 'Vegetal' | 'Animal'>('Todos');
  const [loading,      setLoading]      = useState(true);
  const [histLoading,  setHistLoading]  = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const fetchPrecos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await precosService.getLatest();
      setPrecos(res.data);
    } catch (err) {
      const msg = (err as AxiosError<{ message?: string }>).response?.data?.message;
      setError(msg ?? 'Não foi possível carregar os preços.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistorico = useCallback(async (produto: string, year: number) => {
    setHistLoading(true);
    try {
      const res = await precosService.getHistoricoByYear(produto, year);
      setHistorico(res.data);
    } catch {
      setHistorico([]);
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrecos(); }, [fetchPrecos]);
  useEffect(() => { fetchHistorico(selected, selectedYear); }, [selected, selectedYear, fetchHistorico]);

  // Filter commodity grid
  const filtered = precos.filter((p) => {
    const matchSearch   = p.produto.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'Todos' || meta(p.produto).tipo === category;
    return matchSearch && matchCategory;
  });

  const selectedPreco  = precos.find((p) => p.produto === selected);
  const isFavoravel    = (selectedPreco?.variacaoPct ?? 0) >= 0;
  const seasonal       = getSeasonal(selected);

  // Period variation (first vs last non-null point in historico)
  const validPoints = historico.filter((h) => h.preco !== null);
  const totalVariacao =
    validPoints.length >= 2
      ? parseFloat(
          (((validPoints[validPoints.length - 1].preco! - validPoints[0].preco!) /
            validPoints[0].preco!) * 100).toFixed(1),
        )
      : selectedPreco?.variacaoPct ?? 0;

  const chartColor = totalVariacao >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preços de Mercado</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Análise de preços agrícolas em tempo real · {precos.length} commodities
          </p>
        </div>
        <button
          onClick={fetchPrecos}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 disabled:opacity-60 px-3 py-2 rounded-xl transition-colors"
        >
          <IconRefresh spinning={loading} />
          Atualizar
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Buscar commodity — soja, bovinos, café..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition"
          />
        </div>
        <div className="flex gap-2">
          {(['Todos', 'Vegetal', 'Animal'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={[
                'px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors',
                category === c
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              {c === 'Todos' ? `Todos (${precos.length})` : c === 'Vegetal' ? `🌱 Vegetal` : `🐄 Animal`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero card ── */}
      {selectedPreco && (
        <div className={['rounded-2xl p-5 border', isFavoravel ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'].join(' ')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">
                Momento do Mercado · {selected}
              </p>
              <h2 className="text-2xl font-bold text-white mb-1">
                {isFavoravel ? 'Período Favorável' : 'Período de Cautela'}
              </h2>
              <p className="text-white/80 text-sm">
                {isFavoravel
                  ? `Preço ${selectedPreco.variacaoPct > 0 ? Math.abs(selectedPreco.variacaoPct).toFixed(1) + '% acima' : 'estável'} da última referência.`
                  : `Preço ${Math.abs(selectedPreco.variacaoPct).toFixed(1)}% abaixo da última referência.`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-white">R$ {formatBRL(selectedPreco.preco)}</p>
              <p className="text-white/60 text-xs mt-0.5">por {selectedPreco.unidade}</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
            <span>{isFavoravel ? '✓' : '⚠'}</span>
            {isFavoravel ? seasonal.melhor : seasonal.baixa}
          </div>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && precos.length === 0 && (
        <div className="space-y-3">
          <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ── Cotações grid ── */}
      {precos.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">
            Cotações do Dia
            {search || category !== 'Todos' ? ` · ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}` : ''}
          </h2>

          {filtered.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <p className="text-gray-500 text-sm font-medium">Nenhuma commodity encontrada para "{search}"</p>
              <button onClick={() => { setSearch(''); setCategory('Todos'); }} className="text-primary-600 text-xs font-semibold mt-2 hover:underline">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => (
                <CommodityCard
                  key={p.produto}
                  preco={p}
                  selected={selected === p.produto}
                  onSelect={() => setSelected(p.produto)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Chart section ── */}
      {selectedPreco && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          {/* Chart header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Evolução de Preços</p>
              <p className="text-base font-bold text-gray-900">{selected}</p>
            </div>
            {totalVariacao !== 0 && (
              <div className={['flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl shrink-0',
                totalVariacao > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'].join(' ')}>
                {totalVariacao > 0 ? <IconArrowUp className="w-3.5 h-3.5" /> : <IconArrowDown className="w-3.5 h-3.5" />}
                {totalVariacao > 0 ? '+' : ''}{totalVariacao}%
              </div>
            )}
          </div>

          {/* Year picker */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={[
                  'px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors border',
                  selectedYear === y
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200',
                ].join(' ')}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Chart */}
          {histLoading ? (
            <div className="bg-gray-50 rounded-xl animate-pulse" style={{ height: 200 }} />
          ) : (
            <div className="overflow-hidden rounded-xl">
              <PremiumLineChart points={historico} color={chartColor} height={200} />
            </div>
          )}

          {/* Price summary */}
          {validPoints.length >= 2 && (
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Cotação atual</p>
                <p className="text-lg font-bold text-gray-900">
                  R$ {formatBRL(selectedPreco.preco)}{' '}
                  <span className="text-xs text-gray-400 font-medium">/ {selectedPreco.unidade}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Início do período</p>
                <p className="text-sm font-semibold text-gray-500">
                  R$ {formatBRL(validPoints[0].preco!)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Análise sazonal ── */}
      {selectedPreco && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-gray-500"><IconCalendar /></div>
            <h2 className="text-base font-bold text-gray-900">Análise Sazonal · {selected}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="text-emerald-600"><IconTrend /></div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Melhor Período</p>
              </div>
              <p className="text-base font-bold text-emerald-800 mb-1">{seasonal.melhor}</p>
              <p className="text-xs text-emerald-700 leading-relaxed">{seasonal.melhorDesc}</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="text-red-500"><IconArrowDown className="w-4 h-4" /></div>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Período de Baixa</p>
              </div>
              <p className="text-base font-bold text-red-800 mb-1">{seasonal.baixa}</p>
              <p className="text-xs text-red-700 leading-relaxed">{seasonal.baixaDesc}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-500"><IconInfo /></div>
              <p className="text-sm font-bold text-blue-800">Estratégia de Mercado</p>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">{seasonal.estrategia}</p>
            {selectedPreco && (
              <p className="text-xs text-blue-500 mt-2 font-medium">
                Cotação atual: R$ {formatBRL(selectedPreco.preco)}/{selectedPreco.unidade} ·{' '}
                {isFavoravel ? 'momento favorável para venda' : 'período de cautela, avalie armazenagem'}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && precos.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-6xl">📈</span>
          <div>
            <p className="font-semibold text-gray-700">Nenhum preço disponível</p>
            <p className="text-sm text-gray-400 mt-1">Os preços serão carregados ao reiniciar a API.</p>
          </div>
          <button onClick={fetchPrecos} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
