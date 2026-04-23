import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const APP = 'Agro Controle';

/* ─── Icons ─── */
function ChevronRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function Check({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12a2 2 0 100 4 2 2 0 000-4z" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconCow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M10 2C6.5 2 3.5 4.5 3 8L2 14c-.5 2 .5 4 2.5 4.5V20a2 2 0 002 2h7a2 2 0 002-2v-1.5c2-.5 3-2.5 2.5-4.5L17 8c-.5-3.5-3.5-6-7-6z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function IconWarning() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}
function IconZap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconStar({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
function IconHeadset() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconMinus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ─── Data ─── */
const problems = [
  {
    Icon: IconDatabase,
    title: 'Informação espalhada',
    desc: 'Clima em um app, preços em outro, custos em planilhas. Ninguém aguenta.',
  },
  {
    Icon: IconWarning,
    title: 'Decisões sem dados',
    desc: 'Vender agora ou guardar? Ninguém sabe. Sem histórico para decidir.',
  },
  {
    Icon: IconChart,
    title: 'Falta de controle',
    desc: 'Não sabe quanto ganhou nem forma. Custos invisíveis, prejuízo oculto.',
  },
];

const solutions = [
  {
    Icon: IconLayers,
    title: 'Tudo em um lugar',
    desc: 'Uma única plataforma com todas as informações que você precisa.',
  },
  {
    Icon: IconZap,
    title: 'Decisões baseadas em dados',
    desc: 'Histórico, gráficos e alertas para decidir no momento certo.',
  },
  {
    Icon: IconShield,
    title: 'Controle total',
    desc: 'Saiba exatamente quanto ganhou, gastou e pode lucrar.',
  },
];

const features = [
  {
    Icon: IconCloud,
    title: 'Monitoramento Climático',
    desc: 'Previsão do tempo, alertas de chuva e vento forte em tempo real.',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    Icon: IconChart,
    title: 'Preços de Mercado',
    desc: 'Acompanhe a soja, milho, boi gordo e saiba exatamente quando vender.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    Icon: IconWallet,
    title: 'Controle Financeiro',
    desc: 'Receitas, despesas, fluxo de caixa e análise de rentabilidade por cultura.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    Icon: IconCalendar,
    title: 'Calendário Agrícola',
    desc: 'Lembretes de plantio e colheita personalizados para sua região.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    Icon: IconCow,
    title: 'Gestão de Rebanho',
    desc: 'Controle de gado, ganho de peso, saúde e acompanhamento produtivo.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    Icon: IconStore,
    title: 'Marketplace de Máquinas',
    desc: 'Compare preços de tratores, colheitadeiras e implementos em um só lugar.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
];

const testimonials = [
  {
    quote: 'Deixei de perder dinheiro vendendo na hora errada. O alerta de preço salvou minha safra.',
    name: 'João Silva',
    role: 'Produtor de Soja — MT',
    initials: 'JS',
    stars: 5,
  },
  {
    quote: 'Vida com tudo em meus dados. Simples, completo e faz diferença no campo.',
    name: 'Maria Santos',
    role: 'Consultora Agrônoma — PR',
    initials: 'MS',
    stars: 5,
  },
  {
    quote: 'Finalmente consigo entender custos e produtividade do rebanho em um lugar só.',
    name: 'Pedro Costa',
    role: 'Pecuarista — TO',
    initials: 'PC',
    stars: 5,
  },
];

const freePlanFeatures = ['Preços de mercado básicos', 'Clima e previsão de 7 dias', 'Calendário agrícola simplificado', '1 cultura principal'];
const proPlanFeatures = ['Todas as funcionalidades gratuitas', 'Controle financeiro completo', 'Gestão de rebanho', 'Alertas personalizados', 'Até 5 culturas', 'Suporte prioritário'];
const cooperativaPlanFeatures = ['Tudo do plano Produtor', 'Painel administrativo', 'Gestão de múltiplos produtores', 'Relatórios avançados', 'API de integração', 'Suporte dedicado'];

const faqItems = [
  {
    q: 'Como funciona o período gratuito?',
    a: 'Você pode usar a plataforma com o plano básico e as principais funcionalidades. Para recursos avançados, escolha um plano pago.',
  },
  {
    q: 'Os preços de mercado são atualizados em tempo real?',
    a: 'Sim, atualizamos os preços diariamente com base nas principais bolsas e cooperativas do Brasil.',
  },
  {
    q: 'Funciona offline?',
    a: 'Algumas funcionalidades funcionam offline, mas para alertas e preços em tempo real é necessário conexão com internet.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, total flexibilidade. Você pode cancelar a qualquer momento e continuar o acesso até o fim do período pago.',
  },
];

/* ─── Sub-components ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-100 rounded-2xl bg-white shadow-card overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none font-semibold text-gray-900 text-sm sm:text-base gap-3 hover:bg-gray-50 transition-colors">
        {q}
        <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 group-open:bg-primary-100 flex items-center justify-center text-gray-500 group-open:text-primary-600 transition-all">
          <span className="group-open:hidden"><IconPlus /></span>
          <span className="hidden group-open:block"><IconMinus /></span>
        </span>
      </summary>
      <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>
    </details>
  );
}

function PlanCard({
  name,
  price,
  sub,
  features: planFeatures,
  featured,
  cta,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  featured?: boolean;
  cta: string;
}) {
  return (
    <div
      className={[
        'relative flex flex-col rounded-3xl border p-6 sm:p-8 transition-all duration-200',
        featured
          ? 'bg-primary-500 border-primary-400 shadow-glow text-white'
          : 'bg-white border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5',
      ].join(' ')}
    >
      {featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            Mais Popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <p className={['text-xs font-semibold tracking-widest uppercase mb-2', featured ? 'text-primary-200' : 'text-gray-400'].join(' ')}>
          {name}
        </p>
        <div className="flex items-end gap-1">
          <span className={['text-4xl font-bold', featured ? 'text-white' : 'text-gray-900'].join(' ')}>{price}</span>
          <span className={['text-sm mb-1.5', featured ? 'text-primary-200' : 'text-gray-400'].join(' ')}>{sub}</span>
        </div>
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {planFeatures.map((f) => (
          <li key={f} className={['flex items-start gap-2 text-sm', featured ? 'text-white' : 'text-gray-700'].join(' ')}>
            <span className={['shrink-0 w-4 h-4 mt-0.5 rounded-full flex items-center justify-center', featured ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-500'].join(' ')}>
              <Check className="w-2.5 h-2.5" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        to={ROUTES.REGISTER}
        className={[
          'block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97]',
          featured
            ? 'bg-white text-primary-600 hover:bg-primary-50'
            : 'bg-gray-900 text-white hover:bg-gray-800',
        ].join(' ')}
      >
        {cta}
      </Link>
    </div>
  );
}

/* ─── Main component ─── */
export function Landing() {
  return (
    <div className="min-h-dvh bg-white text-gray-900 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-nav">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow-sm transition-transform duration-150 group-hover:scale-105">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="font-bold text-gray-900 text-[15px] hidden sm:block">{APP}</span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#funcionalidades" className="hover:text-gray-900 transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-gray-900 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
            <Link to={ROUTES.LOGIN} className="hover:text-gray-900 transition-colors">Entrar</Link>
          </nav>

          {/* CTA */}
          <Link
            to={ROUTES.REGISTER}
            className="btn-primary text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5"
          >
            Começar Grátis
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-hero-gradient py-20 sm:py-28 lg:py-36">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 text-center">
          <span className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-slow" />
            Plataforma SaaS Agrícola
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6 text-balance">
            Clima, preços, custos e decisões{' '}
            <span className="text-primary-500">da fazenda em um só lugar</span>
          </h1>

          <p className="text-gray-500 text-base sm:text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl mx-auto text-balance">
            Pare de perder dinheiro por falta de informação no campo.
            Plataforma completa de gestão agrícola para{' '}
            <strong className="text-gray-700 font-semibold">produtores, consultores e cooperativas</strong> brasileiras.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-semibold text-base px-7 py-3.5 rounded-xl hover:bg-primary-600 shadow-sm hover:shadow-glow transition-all duration-200 active:scale-[0.97]"
            >
              Começar Grátis
              <ChevronRight />
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 bg-white text-gray-700 font-semibold text-base px-7 py-3.5 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-all duration-200 active:scale-[0.97]"
            >
              Ver Preços de Mercado
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5"><IconCreditCard /> Sem cartão de crédito</span>
            <span className="hidden sm:block text-gray-200">|</span>
            <span className="flex items-center gap-1.5"><IconRefresh /> Cancele quando quiser</span>
            <span className="hidden sm:block text-gray-200">|</span>
            <span className="flex items-center gap-1.5"><IconHeadset /> Suporte em português</span>
          </div>
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="bg-brand-red py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Por que produtores perdem dinheiro hoje?
            </h2>
            <p className="text-red-300 text-sm sm:text-base max-w-xl mx-auto">
              O problema não é a falta de trabalho. É a falta de informação no momento certo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {problems.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-red-200 mb-4">
                  <Icon />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-red-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="bg-brand-olive py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Como o {APP} resolve isso
            </h2>
            <p className="text-yellow-200/70 text-sm sm:text-base max-w-xl mx-auto">
              Uma plataforma inteligente projetada para o campo brasileiro.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {solutions.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 sm:p-6 hover:bg-white/[0.16] transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/15 flex items-center justify-center text-white mb-4">
                  <Icon />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-yellow-100/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-10 sm:mb-16">
            <p className="section-eyebrow text-primary-500 mb-2">Funcionalidades</p>
            <h2 className="section-title mb-3">Tudo que você precisa para gerenciar</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Uma propriedade rural bem gerida começa com informação de qualidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map(({ Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={['w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110', bg, color].join(' ')}>
                  <Icon />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-10 sm:mb-16">
            <p className="section-eyebrow text-primary-500 mb-2">Depoimentos</p>
            <h2 className="section-title mb-3">O que os produtores dizem</h2>
            <p className="section-subtitle">
              Resultados reais de quem já usa o {APP} no campo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map(({ quote, name, role, initials, stars }) => (
              <div
                key={name}
                className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 sm:p-6 flex flex-col gap-4 hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: stars }).map((_, i) => (
                    <IconStar key={i} filled />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">
                  "{quote}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{name}</p>
                    <p className="text-xs text-gray-400 leading-tight">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="planos" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-10 sm:mb-16">
            <p className="section-eyebrow text-primary-500 mb-2">Planos</p>
            <h2 className="section-title mb-3">Planos para todo tipo de produtor</h2>
            <p className="section-subtitle">
              Escolha o plano ideal para o seu negócio. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            <PlanCard
              name="Gratuito"
              price="R$ 0"
              sub="/mês"
              features={freePlanFeatures}
              cta="Começar Agora"
            />
            <PlanCard
              name="Produtor"
              price="R$ 49"
              sub="/mês"
              features={proPlanFeatures}
              featured
              cta="Começar Agora"
            />
            <PlanCard
              name="Cooperativa"
              price="R$ 199"
              sub="/mês"
              features={cooperativaPlanFeatures}
              cta="Começar Agora"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 sm:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-10 sm:mb-14">
            <p className="section-eyebrow text-primary-500 mb-2">FAQ</p>
            <h2 className="section-title mb-3">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-blue-gradient py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Pronto para tomar decisões mais inteligentes?
          </h2>
          <p className="text-primary-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Junte-se a centenas de produtores que já usam o {APP}.
          </p>
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold text-base px-8 py-3.5 rounded-xl hover:bg-primary-50 shadow-md transition-all duration-200 active:scale-[0.97]"
          >
            Começar Grátis Agora
            <ChevronRight />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-400 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </div>
                <span className="text-white font-bold text-[15px]">{APP}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                Gestão agrícola inteligente para o produtor brasileiro.
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
                <li><Link to={ROUTES.REGISTER} className="hover:text-white transition-colors">Cadastro</Link></li>
                <li><Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">Entrar</Link></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Parceiros</a></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>contato@agrocontrole.com.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>(65) 99999-9999</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} {APP}. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Termos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
