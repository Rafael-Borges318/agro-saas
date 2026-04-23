import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

const APP = 'Agro Controle';

type Mode = 'login' | 'register';

export function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao autenticar. Verifique suas credenciais.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-hero-gradient flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-60 h-60 bg-primary-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-glow transition-transform duration-150 group-hover:scale-105">
              <span className="text-white font-bold text-lg">AC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{APP}</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            {mode === 'login' ? 'Entre na sua conta para continuar' : 'Crie sua conta gratuita agora'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-7">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={[
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                  mode === m
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <Input
                label="Nome completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João Silva"
                required
                autoComplete="name"
              />
            )}
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
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-1">
              {mode === 'login' ? 'Entrar na conta' : 'Criar conta gratuita'}
            </Button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Não tem conta?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary-600 font-semibold hover:underline"
              >
                Cadastre-se grátis
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          <Link to={ROUTES.HOME} className="hover:text-primary-600 transition-colors font-medium">
            ← Voltar para o início
          </Link>
        </p>
      </div>
    </div>
  );
}
