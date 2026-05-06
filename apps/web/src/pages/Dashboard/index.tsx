import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useClimaStore } from '../../store/clima.store';
import { precosService } from '../../services/precos.service';
import { climaService } from '../../services/clima.service';
import { ROUTES } from '../../utils/constants';
import type { PrecoAgricola } from '../../types';

/* ─── Icons ─── */
function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconCow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10 2C6.5 2 3.5 4.5 3 8L2 14c-.5 2 .5 4 2.5 4.5V20a2 2 0 002 2h7a2 2 0 002-2v-1.5c2-.5 3-2.5 2.5-4.5L17 8c-.5-3.5-3.5-6-7-6z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12a2 2 0 100 4 2 2 0 000-4z" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.32c-.31.49.02 1.13.59 1.09A22.58 22.58 0 0012 20c8 0 11-5 11-9a7 7 0 00-6-6.93z" />
      <path d="M3.82 19.32c3-2 6-3 9-3" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function IconArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
function IconArrowDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}
function IconSetup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  );
}

/* ─── Helpers ─── */
const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function formatDate(d: Date) {
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`;
}
function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Derived alerts from real data ─── */
interface Alert {
  key: string;
  borderClass: string;
  dotClass: string;
  badgeClass: string;
  badge: string;
  title: string;
  desc: string;
}

function buildAlerts(
  precos: PrecoAgricola[],
  chuva: boolean,
  climaCidade: string,
): Alert[] {
  const alerts: Alert[] = [];

  if (chuva) {
    alerts.push({
      key: 'chuva',
      borderClass: 'border-l-blue-400',
      dotClass: 'bg-blue-400',
      badgeClass: 'bg-blue-50 text-blue-700',
      badge: 'Clima',
      title: 'Chuva prevista na região',
      desc: `Previsão de chuva para ${climaCidade}. Planeje as atividades de campo.`,
    });
  }

  for (const p of precos) {
    if (p.variacaoPct >= 2) {
      alerts.push({
        key: `up-${p.produto}`,
        borderClass: 'border-l-emerald-400',
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-emerald-50 text-emerald-700',
        badge: 'Mercado',
        title: `${p.produto} subiu ${p.variacaoPct.toFixed(1)}%`,
        desc: `R$ ${formatBRL(p.preco)}/${p.unidade} — Momento favorável para venda.`,
      });
    } else if (p.variacaoPct <= -2) {
      alerts.push({
        key: `down-${p.produto}`,
        borderClass: 'border-l-red-400',
        dotClass: 'bg-red-400',
        badgeClass: 'bg-red-50 text-red-700',
        badge: 'Mercado',
        title: `${p.produto} caiu ${Math.abs(p.variacaoPct).toFixed(1)}%`,
        desc: `R$ ${formatBRL(p.preco)}/${p.unidade} — Avalie o momento de venda.`,
      });
    }
  }

  return alerts.slice(0, 4);
}

const quickLinks = [
  { Icon: IconCloud,  label: 'Clima',      path: ROUTES.CLIMA,       bg: 'bg-primary-50',  text: 'text-primary-500' },
  { Icon: IconChart,  label: 'Mercado',    path: ROUTES.PRECOS,      bg: 'bg-emerald-50',  text: 'text-emerald-600' },
  { Icon: IconDollar, label: 'Financeiro', path: ROUTES.FINANCEIRO,  bg: 'bg-amber-50',    text: 'text-amber-600' },
  { Icon: IconCow,    label: 'Rebanho',    path: ROUTES.ANIMAIS,     bg: 'bg-orange-50',   text: 'text-orange-600' },
  { Icon: IconLeaf,   label: 'Culturas',   path: '#',                bg: 'bg-lime-50',     text: 'text-lime-700' },
  { Icon: IconStore,  label: 'Marketplace',path: ROUTES.MARKETPLACE, bg: 'bg-rose-50',     text: 'text-rose-600' },
];

/* ─── Component ─── */
export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const climaCurrent = useClimaStore((s) => s.current);
  const climaCidade  = useClimaStore((s) => s.cidade);
  const setCurrent   = useClimaStore((s) => s.setCurrent);
  const setForecast  = useClimaStore((s) => s.setForecast);

  const [precos, setPrecos] = useState<PrecoAgricola[]>([]);
  const [precosLoading, setPrecosLoading] = useState(true);
  const [climaLoading, setClimaLoading] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] ?? 'Produtor';

  // Fetch latest prices
  useEffect(() => {
    setPrecosLoading(true);
    precosService
      .getLatest()
      .then((r) => setPrecos(r.data))
      .catch(() => setPrecos([]))
      .finally(() => setPrecosLoading(false));
  }, []);

  // Fetch weather if not already in store
  useEffect(() => {
    if (climaCurrent) return;
    setClimaLoading(true);
    Promise.all([
      climaService.getCurrent({ cidade: climaCidade }),
      climaService.getForecast({ cidade: climaCidade }),
    ])
      .then(([cur, fore]) => {
        setCurrent(cur.data);
        setForecast(fore.data);
      })
      .catch(() => {})
      .finally(() => setClimaLoading(false));
  }, [climaCurrent, climaCidade, setCurrent, setForecast]);

  const soja = precos.find((p) => p.produto.toLowerCase() === 'soja');
  const alerts = buildAlerts(precos, climaCurrent?.chuva ?? false, climaCurrent?.cidade ?? climaCidade);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {greeting}, {firstName}!
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">{formatDate(now)}</p>
        </div>
        <Link
          to={ROUTES.PRECOS}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl"
        >
          <IconChart />
          Ver mercado
        </Link>
      </div>

      {/* ── Market hero card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-blue-gradient p-5 sm:p-6 shadow-glow">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-2 bottom-0 w-24 h-24 bg-white/5 rounded-full" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-primary-200 text-xs font-semibold tracking-wide uppercase mb-2">
              Soja — Cultura Principal
            </p>

            {precosLoading ? (
              <div className="h-12 w-40 bg-white/10 rounded-xl animate-pulse mb-1" />
            ) : soja ? (
              <>
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    R$ {formatBRL(soja.preco)}
                  </span>
                </div>
                <p className="text-primary-200 text-sm mb-4">por {soja.unidade}</p>
              </>
            ) : (
              <>
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white/50 tracking-tight">—</span>
                </div>
                <p className="text-primary-200 text-sm mb-4">sem dados disponíveis</p>
              </>
            )}

            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {soja && soja.variacaoPct > 0
                ? 'Momento favorável para venda'
                : soja && soja.variacaoPct < -2
                ? 'Mercado em queda — monitore'
                : 'Acompanhe o mercado'}
            </div>
          </div>

          {soja && soja.variacaoPct !== 0 && (
            <div className="shrink-0">
              <div
                className={[
                  'flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm',
                  soja.variacaoPct > 0
                    ? 'bg-emerald-400 text-emerald-900'
                    : 'bg-red-400 text-red-900',
                ].join(' ')}
              >
                {soja.variacaoPct > 0 ? <IconArrowUp /> : <IconArrowDown />}
                {soja.variacaoPct > 0 ? '+' : ''}{soja.variacaoPct.toFixed(1)}%
              </div>
              <p className="text-primary-300 text-[10px] text-right mt-1.5 font-medium">
                variação
              </p>
            </div>
          )}
        </div>

        {/* Weather mini-widget */}
        {(climaCurrent || climaLoading) && (
          <div className="relative mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            {climaLoading ? (
              <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
            ) : climaCurrent ? (
              <>
                <div className="flex gap-4">
                  <div>
                    <p className="text-primary-300 text-[10px] font-medium uppercase tracking-wider mb-0.5">
                      {climaCurrent.cidade}
                    </p>
                    <p className="text-white text-sm font-bold">
                      {climaCurrent.temperatura}°C · {climaCurrent.descricao}
                    </p>
                  </div>
                  {climaCurrent.chuva && (
                    <div className="flex items-center">
                      <span className="text-[10px] font-semibold text-blue-200 bg-blue-400/20 px-2 py-0.5 rounded-full border border-blue-300/20">
                        Chuva prevista
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  to={ROUTES.CLIMA}
                  className="flex items-center gap-1 text-primary-200 text-xs font-semibold hover:text-white transition-colors"
                >
                  Clima <IconChevronRight />
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Animais ativos', value: '—', Icon: IconCow,    color: 'bg-orange-50 text-orange-500 ring-orange-100', sub: 'Conecte sua propriedade' },
          { label: 'Saldo do mês',   value: '—', Icon: IconWallet, color: 'bg-amber-50 text-amber-500 ring-amber-100',   sub: 'Configure o financeiro' },
          { label: 'Culturas',       value: '—', Icon: IconLeaf,   color: 'bg-lime-50 text-lime-600 ring-lime-100',      sub: 'Adicione uma cultura' },
          {
            label: 'Alertas',
            value: alerts.length > 0 ? String(alerts.length) : '—',
            Icon: IconBell,
            color: 'bg-primary-50 text-primary-500 ring-primary-100',
            sub: alerts.length > 0 ? `${alerts.length} novo${alerts.length > 1 ? 's' : ''} alerta${alerts.length > 1 ? 's' : ''}` : 'Sem alertas',
          },
        ].map(({ label, value, Icon, color, sub }) => (
          <div key={label} className="card flex items-center gap-3.5">
            <div className={['w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ring-1', color].join(' ')}>
              <Icon />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
              <p className="text-xl font-bold text-gray-900 leading-none my-0.5">{value}</p>
              <p className="text-xs text-gray-400 truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Alerts ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Alertas Importantes</h2>
          <Link to={ROUTES.PRECOS} className="text-xs text-primary-500 font-semibold hover:text-primary-600 flex items-center gap-1 transition-colors">
            Ver preços <IconChevronRight />
          </Link>
        </div>

        {precosLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2.5">
            {alerts.map(({ key, borderClass, dotClass, badgeClass, title, desc, badge }) => (
              <div
                key={key}
                className={['bg-white rounded-2xl border border-gray-100 shadow-card border-l-4 px-4 py-3.5 flex items-start gap-3 hover:shadow-card-hover transition-all duration-150', borderClass].join(' ')}
              >
                <div className={['w-2 h-2 rounded-full mt-1.5 shrink-0', dotClass].join(' ')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <span className={['text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', badgeClass].join(' ')}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-4 py-5 text-center">
            <p className="text-sm text-gray-400">Nenhum alerta no momento. O mercado está estável.</p>
          </div>
        )}
      </div>

      {/* ── Quick access ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map(({ Icon, label, path, bg, text }) => (
            <Link
              key={label}
              to={path}
              className="bg-white rounded-2xl border border-gray-100 shadow-card flex flex-col items-center gap-2.5 py-4 px-2 hover:shadow-card-hover hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 text-center group"
            >
              <div className={['w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110', bg, text].join(' ')}>
                <Icon />
              </div>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Setup CTA ── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-500 to-primary-600 p-5 shadow-glow-sm">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/5 rounded-full" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <IconSetup />
              </div>
              <h3 className="font-bold text-white text-sm">Configure sua propriedade</h3>
            </div>
            <p className="text-primary-100 text-xs leading-relaxed max-w-xs">
              Adicione sua propriedade e perfil de produtor para desbloquear todos os recursos.
            </p>
          </div>
          <Link
            to={ROUTES.ADMIN}
            className="shrink-0 flex items-center gap-1 bg-white text-primary-600 text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-primary-50 transition-colors"
          >
            Configurar <IconChevronRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
