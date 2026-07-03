import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AccountSwitcher } from './AccountSwitcher';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Zenith Finance</h1>
        <AccountSwitcher />
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/transactions">Transações</NavLink>
          <NavLink to="/categories">Categorias</NavLink>
          <NavLink to="/transfers">Transferências</NavLink>
        </nav>
        <div className="app-header-user">
          <span>{user?.name}</span>
          <button type="button" onClick={() => logout()}>
            Sair
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
