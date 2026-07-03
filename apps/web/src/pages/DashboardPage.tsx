import { TransactionType } from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';

export function DashboardPage() {
  const { activeAccount } = useAccounts();
  const { transactions, isLoading } = useTransactions(activeAccount?.id ?? null);

  const balance = transactions.reduce((sum, t) => {
    const amount = Number(t.amount);
    return t.type === TransactionType.INCOME ? sum + amount : sum - amount;
  }, 0);

  if (!activeAccount) {
    return <p>Nenhuma conta selecionada.</p>;
  }

  return (
    <div>
      <h2>{activeAccount.name}</h2>
      <p className="balance">
        Saldo: {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>

      <h3>Últimas transações</h3>
      {isLoading ? (
        <p>Carregando...</p>
      ) : transactions.length === 0 ? (
        <p>Nenhuma transação ainda.</p>
      ) : (
        <ul className="transaction-list">
          {transactions.slice(0, 5).map((t) => (
            <li key={t.id}>
              <span>{t.description}</span>
              <span className={t.type === TransactionType.INCOME ? 'positive' : 'negative'}>
                {t.type === TransactionType.INCOME ? '+' : '-'}
                {Number(t.amount).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
