import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useViewMode, VIEW_MODE_OPTIONS } from '../../context/ViewModeContext';
import { AccountSwitcher } from './AccountSwitcher';
import { WalletSection } from './WalletSection';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transações' },
  { to: '/graphs', label: 'Gráficos' },
  { to: '/investments', label: 'Investimentos' },
  { to: '/goals', label: 'Objetivos' },
  { to: '/categories', label: 'Categorias' },
  { to: '/transfers', label: 'Transferências' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-logo">
          <span className="app-logo-mark">Z</span>
          <span className="app-logo-text">Zenith</span>
        </div>

        <nav className="app-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                'app-nav-link' + (isActive ? ' active' : '')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <WalletSection />

        <div className="app-sidebar-footer">
          <div className="app-user">
            <span className="app-user-avatar">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
            <span className="app-user-name">{user?.name}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={() => logout()}>
            Sair
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <AccountSwitcher />
          <div className="topbar-view-mode">
            {VIEW_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`topbar-view-btn${viewMode === opt.value ? ' active' : ''}`}
                onClick={() => setViewMode(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
