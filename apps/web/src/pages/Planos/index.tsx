import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { plansService } from '../../services/plans.service';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../utils/constants';
import type { Plan } from '../../types';

function IconCheck({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function formatPrice(preco: number): string {
  if (preco === 0) return 'R$ 0';
  return `R$ ${preco.toLocaleString('pt-BR')}`;
}

const PLAN_ORDER = ['Gratuito', 'Produtor', 'Cooperativa'];
const FEATURED_PLAN = 'Produtor';

function PlanCard({
  plan,
  featured,
  recommended,
  onSelect,
  loading,
}: {
  plan: Plan;
  featured?: boolean;
  recommended?: boolean;
  onSelect: (plan: Plan) => void;
  loading: boolean;
}) {
  return (
    <div
      className={[
        'relative flex flex-col rounded-3xl border p-6 sm:p-7 transition-all duration-200',
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
      {recommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            Recomendado
          </span>
        </div>
      )}

      <div className="mb-5">
        <p className={['text-xs font-semibold tracking-widest uppercase mb-2', featured ? 'text-primary-200' : 'text-gray-400'].join(' ')}>
          {plan.nome}
        </p>
        <div className="flex items-end gap-1">
          <span className={['text-4xl font-bold tracking-tight', featured ? 'text-white' : 'text-gray-900'].join(' ')}>
            {formatPrice(plan.preco)}
          </span>
          <span className={['text-sm mb-1.5', featured ? 'text-primary-200' : 'text-gray-400'].join(' ')}>
            {plan.preco === 0 ? '/mês' : '/mês'}
          </span>
        </div>
        <p className={['text-xs mt-2 leading-relaxed', featured ? 'text-primary-100' : 'text-gray-500'].join(' ')}>
          {plan.descricao}
        </p>
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {plan.features.map((f) => (
          <li key={f} className={['flex items-start gap-2 text-sm', featured ? 'text-white' : 'text-gray-700'].join(' ')}>
            <span className={['shrink-0 w-4 h-4 mt-0.5 rounded-full flex items-center justify-center', featured ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-500'].join(' ')}>
              <IconCheck className="w-2.5 h-2.5" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={loading}
        className={[
          'block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed',
          featured
            ? 'bg-white text-primary-600 hover:bg-primary-50'
            : 'bg-gray-900 text-white hover:bg-gray-800',
        ].join(' ')}
      >
        {plan.preco === 0 ? 'Começar Grátis' : 'Assinar Agora'}
      </button>
    </div>
  );
}

export function Planos() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [plansError, setPlansError] = useState('');
  const [subscribeError, setSubscribeError] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  void searchParams; // plano param carried forward for future use
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    plansService.list()
      .then(({ data }) => {
        const sorted = [...data.data].sort(
          (a, b) => PLAN_ORDER.indexOf(a.nome) - PLAN_ORDER.indexOf(b.nome),
        );
        setPlans(sorted);
      })
      .catch(() => setPlansError('Erro ao carregar planos. Atualize a página.'))
      .finally(() => setLoadingPlans(false));
  }, []);

  const handleSelect = async (plan: Plan) => {
    setSubscribeError('');
    setSubscribing(plan.id);
    try {
      await plansService.subscribe(plan.id);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao assinar. Tente novamente.';
      setSubscribeError(msg);
    } finally {
      setSubscribing(null);
    }
  };

  const isLoading = subscribing !== null;

  return (
    <div className="min-h-dvh bg-hero-gradient flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-primary-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">AC</span>
          </div>
          <span className="font-bold text-gray-900 text-base">Agro Controle</span>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Escolha seu plano
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            {user?.name ? `Olá, ${user.name.split(' ')[0]}!` : 'Olá!'}{' '}
            Você pode mudar de plano a qualquer momento.
          </p>
        </div>

        {plansError && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium text-center mb-6">
            {plansError}
          </div>
        )}

        {subscribeError && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium text-center mb-6">
            {subscribeError}
          </div>
        )}

        {loadingPlans ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-stretch mb-8">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                featured={plan.nome === FEATURED_PLAN}
                onSelect={handleSelect}
                loading={isLoading}
              />
            ))}
          </div>
        )}

        {/* Trust */}
        <div className="text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Sem cartão de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              Cancele quando quiser
            </span>
          </div>

          <button
            onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium flex items-center gap-1 mx-auto"
          >
            Continuar com plano gratuito por enquanto
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
