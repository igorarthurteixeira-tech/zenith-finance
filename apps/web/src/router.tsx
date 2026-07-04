import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AccountProvider } from './context/AccountContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { GraphsPage } from './pages/GraphsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { TransfersPage } from './pages/TransfersPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { GoalsPage } from './pages/GoalsPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <AccountProvider><ViewModeProvider>{children}</ViewModeProvider></AccountProvider>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="graphs" element={<GraphsPage />} />
          <Route path="investments" element={<InvestmentsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="goals" element={<GoalsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
