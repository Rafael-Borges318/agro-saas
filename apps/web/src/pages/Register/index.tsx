import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

const PLAN_LABELS: Record<string, string> = {
  gratuito: 'Plano Gratuito',
  produtor: 'Plano Produtor — R$ 49/mês',
  cooperativa: 'Plano Cooperativa — R$ 199/mês',
};

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get('plano') ?? 'gratuito';
  const planLabel = PLAN_LABELS[planSlug] ?? PLAN_LABELS.gratuito;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(name.trim(), email.trim().toLowerCase(), password);
      // New users always go through onboarding first
      if (!user.onboardingCompleted) {
        navigate(`${ROUTES.ONBOARDING}?plano=${planSlug}`, { replace: true });
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-hero-gradient flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-60 h-60 bg-primary-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-glow transition-transform duration-150 group-hover:scale-105">
              <span className="text-white font-bold text-lg">AC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Agro Controle</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Crie sua conta gratuita agora</p>
        </div>

        {/* Plan badge */}
        {planSlug !== 'gratuito' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <IconCheck />
              {planLabel} selecionado
            </span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Criar conta</h2>
          <p className="text-sm text-gray-500 mb-6">Sem cartão de crédito. Sem compromisso.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-1">
              Criar conta gratuita
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Já tem conta?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-600 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Ao criar conta você concorda com nossos{' '}
          <a href="#" className="text-primary-600 hover:underline">Termos</a> e{' '}
          <a href="#" className="text-primary-600 hover:underline">Política de Privacidade</a>.
        </p>

        <p className="text-center text-sm text-gray-400 mt-3">
          <Link to={ROUTES.HOME} className="hover:text-primary-600 transition-colors font-medium">
            ← Voltar para o início
          </Link>
        </p>
      </div>
    </div>
  );
}
