import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { UpdateTransactionInput } from '@zenith/shared';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const walletId = searchParams.get('walletId');

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  const activeWallet = walletId ? wallets.find((w) => w.id === walletId) : null;
  const filteredTransactions = walletId
    ? transactions.filter((t) => t.walletId === walletId)
    : transactions;

  async function handleUpdate(transactionId: string, input: UpdateTransactionInput) {
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
        {activeWallet && (
          <span className="wallet-filter-tag">
            {activeWallet.name}
            <button
              type="button"
              className="wallet-filter-clear"
              onClick={() => setSearchParams({})}
              aria-label="Remover filtro"
            >
              ×
            </button>
          </span>
        )}
        <div className="view-mode-group">
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
      </div>

      <div className="card">
        {isLoading ? (
          <p className="muted">Carregando...</p>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
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
