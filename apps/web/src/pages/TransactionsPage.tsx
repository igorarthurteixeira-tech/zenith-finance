import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  WalletType,
  currentOpenInvoicePeriod,
  addMonthsToPeriod,
  invoicePeriodLabel,
  periodOfDate,
  type UpdateTransactionInput,
} from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { useViewMode } from '../context/ViewModeContext';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionList } from '../components/transactions/TransactionList';
import { SpendingHistoryChart } from '../components/charts/SpendingHistoryChart';
import { CreditCardSection } from '../components/wallets/CreditCardSection';

export function TransactionsPage() {
  const { activeAccount } = useAccounts();
  const accountId = activeAccount?.id ?? null;
  const {
    transactions,
    isLoading,
    create,
    createInstallmentPurchase,
    update,
    updateInstallmentGroup,
    remove,
    removeInstallmentGroup,
  } = useTransactions(accountId);
  const { categories } = useCategories(accountId);
  const { wallets, create: createWallet, update: updateWallet } = useWallets(accountId);
  const { periodRange } = useViewMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const walletId = searchParams.get('walletId');
  const activeWallet = walletId ? wallets.find((w) => w.id === walletId) : null;
  const isCardView = activeWallet?.type === WalletType.CARTAO_CREDITO;

  const [invoicePeriod, setInvoicePeriod] = useState<string | null>(null);

  useEffect(() => {
    if (isCardView && activeWallet) {
      setInvoicePeriod(currentOpenInvoicePeriod(activeWallet.closingDay));
    } else {
      setInvoicePeriod(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId, isCardView]);

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  const filteredTransactions = transactions.filter((t) => {
    if (walletId && t.walletId !== walletId) return false;
    if (isCardView && invoicePeriod) {
      const effectivePeriod = t.invoicePeriod ?? periodOfDate(new Date(t.date));
      return effectivePeriod === invoicePeriod;
    }
    const d = new Date(t.date);
    return d >= periodRange.start && d <= periodRange.end;
  });

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
          onUpdateCard={(walletId, input) => updateWallet({ walletId, input })}
          onSelectCard={(id) => setSearchParams({ walletId: id })}
        />
      )}

      {isCardView && invoicePeriod && (
        <div className="invoice-period-nav">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setInvoicePeriod(addMonthsToPeriod(invoicePeriod, -1))}
            aria-label="Fatura anterior"
          >
            ←
          </button>
          <span className="invoice-period-label">Fatura de {invoicePeriodLabel(invoicePeriod)}</span>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setInvoicePeriod(addMonthsToPeriod(invoicePeriod, 1))}
            aria-label="Próxima fatura"
          >
            →
          </button>
        </div>
      )}

      <SpendingHistoryChart transactions={filteredTransactions} wallets={wallets} />

      <div className="card">
        <TransactionForm
          categories={categories}
          wallets={wallets}
          onSubmit={create}
          onSubmitInstallments={createInstallmentPurchase}
          defaultWalletId={activeWallet?.id}
        />
      </div>

      {activeWallet && (
        <div className="view-mode-bar">
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
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <p className="muted">Carregando...</p>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            wallets={wallets}
            onRemove={remove}
            onRemoveGroup={removeInstallmentGroup}
            onUpdate={handleUpdate}
            onUpdateGroup={async (groupId, input) => updateInstallmentGroup({ installmentGroupId: groupId, input })}
          />
        )}
      </div>
    </div>
  );
}
