import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../utils/constants';

const APP_DISPLAY = 'Agro Controle';

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 safe-top shadow-nav">
      <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow-sm shrink-0 transition-all duration-200 group-hover:scale-105">
            <span className="text-white font-bold text-sm leading-none">AC</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-gray-900 text-[15px] leading-none">{APP_DISPLAY}</span>
            <span className="block text-[10px] text-gray-400 leading-none mt-0.5 font-medium">Gestão Agrícola</span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              <UserAvatar name={user.name} />
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{user.name.split(' ')[0]}</p>
                <p className="text-[10px] text-gray-400 capitalize leading-tight">{user.role?.toLowerCase()}</p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            title="Sair da conta"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 text-xs font-medium"
          >
            <LogoutIcon />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
