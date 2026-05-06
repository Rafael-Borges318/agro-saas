import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { adminService, type AdminStats, type AdminUser } from '../../services/admin.service';
import { ROUTES } from '../../utils/constants';

/* ─── Icons ─── */
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconFarm() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconCow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10 2C6.5 2 3.5 4.5 3 8L2 14c-.5 2 .5 4 2.5 4.5V20a2 2 0 002 2h7a2 2 0 002-2v-1.5c2-.5 3-2.5 2.5-4.5L17 8c-.5-3.5-3.5-6-7-6z" />
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
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconToggleOn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="1" y="5" width="22" height="14" rx="7" />
      <circle cx="16" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
function IconToggleOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="1" y="5" width="22" height="14" rx="7" />
      <circle cx="8" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

/* ─── Helpers ─── */
const ROLE_LABELS: Record<string, string> = {
  PRODUTOR: 'Produtor',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ─── Component ─── */
export function Admin() {
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Non-admins are redirected; backend also enforces this
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([adminService.getStats(), adminService.listUsers()])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data);
      })
      .catch(() => setError('Falha ao carregar dados administrativos.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggle(id: string) {
    setTogglingId(id);
    try {
      const res = await adminService.toggleUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: res.data.isActive } : u)));
    } catch {
      setError('Falha ao alterar status do usuário.');
    } finally {
      setTogglingId(null);
    }
  }

  const statCards = [
    { label: 'Usuários cadastrados', value: stats?.users ?? '—', Icon: IconUsers,  color: 'bg-primary-50 text-primary-500 ring-primary-100' },
    { label: 'Produtores',           value: stats?.produtores ?? '—', Icon: IconFarm, color: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
    { label: 'Animais ativos',       value: stats?.animais ?? '—', Icon: IconCow,   color: 'bg-orange-50 text-orange-500 ring-orange-100' },
    { label: 'Culturas',             value: stats?.culturas ?? '—', Icon: IconLeaf,  color: 'bg-lime-50 text-lime-600 ring-lime-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-white">
            <IconShield />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        </div>
        <p className="text-gray-400 text-sm">Visão geral da plataforma e gerenciamento de usuários</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, Icon, color }) => (
          <div key={label} className="card flex items-center gap-3.5">
            <div className={['w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ring-1', color].join(' ')}>
              <Icon />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
              {loading ? (
                <div className="h-6 w-12 bg-gray-100 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="text-xl font-bold text-gray-900 leading-none my-0.5">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Users table ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Usuários da Plataforma</h2>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            {users.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-gray-400">Nenhum usuário encontrado.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3.5">
                    {/* Avatar placeholder */}
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary-600">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        {(u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                            {ROLE_LABELS[u.role]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-gray-400 mb-1">desde {formatDate(u.createdAt)}</p>
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={togglingId === u.id || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'}
                        className={[
                          'transition-colors disabled:opacity-40',
                          u.isActive ? 'text-emerald-500 hover:text-emerald-600' : 'text-gray-300 hover:text-gray-400',
                        ].join(' ')}
                        title={u.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        {u.isActive ? <IconToggleOn /> : <IconToggleOff />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
