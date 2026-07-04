import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AccountSwitcher } from './AccountSwitcher';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transações' },
  { to: '/investments', label: 'Investimentos' },
  { to: '/categories', label: 'Categorias' },
  { to: '/transfers', label: 'Transferências' },
];

export function AppLayout() {
  const { user, logout } = useAuth();

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
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
