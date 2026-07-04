import { TransactionType } from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { formatDateTime } from '../utils/formatDate';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DashboardPage() {
  const { activeAccount } = useAccounts();
  const { transactions, isLoading } = useTransactions(activeAccount?.id ?? null);
  const { wallets } = useWallets(activeAccount?.id ?? null);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.countsInTotal && d >= monthStart && d <= monthEnd;
  });
  const realized = transactions.filter(
    (t) => t.countsInTotal && new Date(t.date) <= todayEnd,
  );

  const income = thisMonth
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = thisMonth
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Saldo = tudo realizado até hoje + saldos iniciais
  const initialBalances = wallets.reduce((sum, w) => sum + Number(w.initialBalance), 0);
  const realizedIncome = realized.filter((t) => t.type === TransactionType.INCOME).reduce((s, t) => s + Number(t.amount), 0);
  const realizedExpense = realized.filter((t) => t.type === TransactionType.EXPENSE).reduce((s, t) => s + Number(t.amount), 0);
  const balance = realizedIncome - realizedExpense + initialBalances;

  if (!activeAccount) {
    return <p>Nenhuma conta selecionada.</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>{activeAccount.name}</h2>
        <p className="page-subtitle">Visão geral da sua conta</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-card-primary">
          <span className="stat-label">Saldo atual</span>
          <span className="stat-value">{formatCurrency(balance)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Receitas do mês</span>
          <span className="stat-value positive">{formatCurrency(income)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Despesas do mês</span>
          <span className="stat-value negative">{formatCurrency(expense)}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Últimas transações</h3>
        {isLoading ? (
          <p className="muted">Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="muted">Nenhuma transação ainda.</p>
        ) : (
          <ul className="transaction-list">
            {transactions.slice(0, 5).map((t) => (
              <li key={t.id}>
                <div className="transaction-info">
                  <span className="transaction-description">{t.description}</span>
                  <span className="transaction-date">{formatDateTime(t.date)}</span>
                </div>
                <span
                  className={
                    t.type === TransactionType.INCOME ? 'positive' : 'negative'
                  }
                >
                  {t.type === TransactionType.INCOME ? '+' : '-'}
                  {formatCurrency(Number(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
