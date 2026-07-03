import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionList } from '../components/transactions/TransactionList';

export function TransactionsPage() {
  const { activeAccount } = useAccounts();
  const accountId = activeAccount?.id ?? null;
  const { transactions, isLoading, create, remove } = useTransactions(accountId);
  const { categories } = useCategories(accountId);

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Transações</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      <div className="card">
        <TransactionForm categories={categories} onSubmit={create} />
      </div>

      <div className="card">
        {isLoading ? (
          <p className="muted">Carregando...</p>
        ) : (
          <TransactionList transactions={transactions} onRemove={remove} />
        )}
      </div>
    </div>
  );
}
