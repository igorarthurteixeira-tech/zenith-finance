import { useState } from 'react';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionList, type ViewMode } from '../components/transactions/TransactionList';

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semester', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
];

export function TransactionsPage() {
  const { activeAccount } = useAccounts();
  const accountId = activeAccount?.id ?? null;
  const { transactions, isLoading, create, update, remove } = useTransactions(accountId);
  const { categories } = useCategories(accountId);
  const { wallets } = useWallets(accountId);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  async function handleUpdate(transactionId: string, input: Parameters<typeof update>[0]['input']) {
    await update({ transactionId, input });
  }

  return (
    <div>
      <div className="page-header">
        <h2>Transações</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      <div className="card">
        <TransactionForm categories={categories} wallets={wallets} onSubmit={create} />
      </div>

      <div className="view-mode-bar">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={`view-mode-btn${viewMode === mode.value ? ' active' : ''}`}
            onClick={() => setViewMode(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <p className="muted">Carregando...</p>
        ) : (
          <TransactionList
            transactions={transactions}
            categories={categories}
            wallets={wallets}
            onRemove={remove}
            onUpdate={handleUpdate}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}
