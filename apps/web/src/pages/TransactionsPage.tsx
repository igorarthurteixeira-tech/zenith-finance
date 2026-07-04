import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WalletType, type UpdateTransactionInput } from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionList, type ViewMode } from '../components/transactions/TransactionList';
import { SpendingHistoryChart } from '../components/charts/SpendingHistoryChart';
import { CreditCardSection } from '../components/wallets/CreditCardSection';

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
  const { wallets, create: createWallet } = useWallets(accountId);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [searchParams, setSearchParams] = useSearchParams();
  const walletId = searchParams.get('walletId');

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  const activeWallet = walletId ? wallets.find((w) => w.id === walletId) : null;
  const filteredTransactions = walletId
    ? transactions.filter((t) => t.walletId === walletId)
    : transactions;

  const parentOfActiveCard =
    activeWallet?.type === WalletType.CARTAO_CREDITO
      ? wallets.find((w) => w.id === activeWallet.parentWalletId)
      : null;
  const cardsOfActiveAccount =
    activeWallet?.type === WalletType.CONTA
      ? wallets.filter((w) => w.parentWalletId === activeWallet.id)
      : [];

  async function handleUpdate(transactionId: string, input: UpdateTransactionInput) {
    await update({ transactionId, input });
  }

  return (
    <div>
      <div className="page-header">
        <h2>Transações</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      {parentOfActiveCard && (
        <button
          type="button"
          className="wallet-back-link"
          onClick={() => setSearchParams({ walletId: parentOfActiveCard.id })}
        >
          ← Voltar para {parentOfActiveCard.name}
        </button>
      )}

      {activeWallet?.type === WalletType.CONTA && (
        <CreditCardSection
          account={activeWallet}
          cards={cardsOfActiveAccount}
          transactions={transactions}
          onCreateCard={createWallet}
          onSelectCard={(id) => setSearchParams({ walletId: id })}
        />
      )}

      <SpendingHistoryChart transactions={filteredTransactions} wallets={wallets} />

      <div className="card">
        <TransactionForm
          categories={categories}
          wallets={wallets}
          onSubmit={create}
          defaultWalletId={activeWallet?.id}
        />
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
