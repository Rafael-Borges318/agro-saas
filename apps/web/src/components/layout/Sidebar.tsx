import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

/* ───── SVG icon components ───── */
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconClima() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  );
}

function IconPrecos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconFinanceiro() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IconAnimais() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10 2C6.5 2 3.5 4.5 3 8L2 14c-.5 2 .5 4 2.5 4.5V20a2 2 0 002 2h7a2 2 0 002-2v-1.5c2-.5 3-2.5 2.5-4.5L17 8c-.5-3.5-3.5-6-7-6z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconRelatorios() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}

function IconMarketplace() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  );
}

const navItems = [
  { label: 'Dashboard',   Icon: IconDashboard,    path: ROUTES.DASHBOARD },
  { label: 'Clima',       Icon: IconClima,         path: ROUTES.CLIMA },
  { label: 'Mercado',     Icon: IconPrecos,        path: ROUTES.PRECOS },
  { label: 'Financeiro',  Icon: IconFinanceiro,    path: ROUTES.FINANCEIRO },
  { label: 'Rebanho',     Icon: IconAnimais,       path: ROUTES.ANIMAIS },
  { label: 'Relatórios',  Icon: IconRelatorios,    path: ROUTES.RELATORIOS },
  { label: 'Marketplace', Icon: IconMarketplace,   path: ROUTES.MARKETPLACE },
];

function NavItem({
  Icon,
  label,
  path,
}: {
  Icon: () => JSX.Element;
  label: string;
  path: string;
}) {
  return (
    <NavLink
      to={path}
      title={label}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
          isActive
            ? 'bg-primary-500 text-white shadow-glow-sm'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
        ].join(' ')
      }
    >
      <span className="shrink-0 transition-transform duration-150 group-hover:scale-105">
        <Icon />
      </span>
      <span className="hidden lg:block whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-16 lg:w-[228px] fixed left-0 top-16 bottom-0 bg-white border-r border-gray-100 shadow-sidebar z-30">
      {/* Brand identity strip at top */}
      <div className="hidden lg:flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 mb-1">
        <div className="w-6 h-6 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-[10px] leading-none">AC</span>
        </div>
        <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">Agro Controle</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Admin link at bottom */}
      <div className="px-2 py-3 border-t border-gray-100">
        <NavLink
          to={ROUTES.ADMIN}
          title="Administração"
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary-500 text-white shadow-glow-sm'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
            ].join(' ')
          }
        >
          <span className="shrink-0">
            <IconAdmin />
          </span>
          <span className="hidden lg:block">Administração</span>
        </NavLink>
      </div>
    </aside>
  );
}

/* ───── Mobile bottom navigation ───── */
export function BottomNav() {
  const bottomItems = navItems.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 safe-bottom shadow-[0_-1px_0_rgba(0,0,0,0.05)]">
      <div className="flex">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-all duration-150',
                isActive ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'transition-transform duration-150',
                    isActive ? 'scale-110' : '',
                  ].join(' ')}
                >
                  <item.Icon />
                </span>
                <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
