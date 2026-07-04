import { useState } from 'react';
import {
  TransactionType,
  type TransactionDto,
  type CategoryDto,
  type WalletDto,
  type UpdateTransactionInput,
  type UpdateInstallmentGroupInput,
  type InstallmentGroupScope,
} from '@zenith/shared';
import { TransactionForm } from './TransactionForm';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useAsyncSet } from '../../hooks/useAsyncAction';
import { formatDateTime } from '../../utils/formatDate';

interface TransactionListProps {
  transactions: TransactionDto[];
  categories: CategoryDto[];
  wallets: WalletDto[];
  onRemove: (transactionId: string) => Promise<void>;
  onRemoveGroup?: (args: { installmentGroupId: string; scope?: string; referenceDate?: string }) => Promise<unknown>;
  onUpdate: (transactionId: string, input: UpdateTransactionInput) => Promise<unknown>;
  onUpdateGroup?: (installmentGroupId: string, input: UpdateInstallmentGroupInput) => Promise<unknown>;
}

interface ConfirmingDelete {
  transactionId: string;
  groupId: string;
  date: string;
}

function computeSummary(transactions: TransactionDto[]) {
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME && t.countsInTotal)
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE && t.countsInTotal)
    .reduce((s, t) => s + Number(t.amount), 0);
  return { totalIncome, totalExpense };
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function TransactionList({
  transactions,
  categories,
  wallets,
  onRemove,
  onRemoveGroup,
  onUpdate,
  onUpdateGroup,
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<ConfirmingDelete | null>(null);
  const { pendingIds: removingIds, run: runRemove } = useAsyncSet();

  function handleDeleteClick(t: TransactionDto) {
    if (t.installmentGroupId && onRemoveGroup) {
      setConfirmingDelete({ transactionId: t.id, groupId: t.installmentGroupId, date: t.date });
    } else {
      const ok = window.confirm('Remover esta transação?');
      if (ok) runRemove(t.id, () => onRemove(t.id));
    }
  }

  function handleDeleteScope(scope: InstallmentGroupScope | 'single') {
    if (!confirmingDelete || !onRemoveGroup) return;
    const { transactionId, groupId, date } = confirmingDelete;
    setConfirmingDelete(null);
    if (scope === 'all') {
      runRemove(groupId, () => onRemoveGroup({ installmentGroupId: groupId, scope: 'all' }));
    } else if (scope === 'before') {
      runRemove(groupId, () => onRemoveGroup({ installmentGroupId: groupId, scope: 'before', referenceDate: date }));
    } else if (scope === 'up_to') {
      runRemove(groupId, () => onRemoveGroup({ installmentGroupId: groupId, scope: 'up_to', referenceDate: date }));
    } else {
      runRemove(transactionId, () => onRemove(transactionId));
    }
  }

  if (transactions.length === 0) {
    return <p className="muted">Nenhuma transação ainda.</p>;
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const { totalIncome, totalExpense } = computeSummary(transactions);

  return (
    <>
      <div className="timeline-header">
        <div className="timeline-summary">
          <span className="positive">+{formatBRL(totalIncome)}</span>
          <span className="negative">-{formatBRL(totalExpense)}</span>
          <span className={totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}>
            = {formatBRL(totalIncome - totalExpense)}
          </span>
        </div>
      </div>

      <ul className="transaction-list">
        {sorted.map((t) => {
          const isConfirming = confirmingDelete?.transactionId === t.id;
          const isRemoving = removingIds.has(t.id) || (t.installmentGroupId ? removingIds.has(t.installmentGroupId) : false);

          return (
            <li key={t.id}>
              <div className="transaction-info">
                <span className="transaction-description">{t.description}</span>
                <span className="transaction-date">{formatDateTime(t.date)}</span>
                {wallets.find((w) => w.id === t.walletId) && (
                  <span className="transaction-wallet">
                    {wallets.find((w) => w.id === t.walletId)?.name}
                  </span>
                )}
                {!t.countsInTotal && (
                  <span className="transaction-badge" title="Não soma no total — apenas histórico">
                    histórico
                  </span>
                )}
              </div>

              <span
                className={t.type === TransactionType.INCOME ? 'positive' : 'negative'}
                style={!t.countsInTotal ? { opacity: 0.55 } : undefined}
              >
                {t.type === TransactionType.INCOME ? '+' : '-'}
                {formatBRL(Number(t.amount))}
              </span>

              <div className="transaction-actions">
                {isConfirming ? (
                  <div className="delete-scope-bar">
                    <span className="delete-scope-label">Excluir:</span>
                    <button type="button" className="btn-scope" onClick={() => handleDeleteScope('all' as InstallmentGroupScope)}>Todas</button>
                    <button type="button" className="btn-scope" onClick={() => handleDeleteScope('up_to' as InstallmentGroupScope)}>Esta e anteriores</button>
                    <button type="button" className="btn-scope" onClick={() => handleDeleteScope('before' as InstallmentGroupScope)}>Anteriores</button>
                    <button type="button" className="btn-scope btn-scope-single" onClick={() => handleDeleteScope('single')}>Só esta</button>
                    <button type="button" className="btn-scope btn-scope-cancel" onClick={() => setConfirmingDelete(null)}>Cancelar</button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-icon btn-icon-edit"
                      onClick={() => setEditingTransaction(t)}
                      aria-label="Editar"
                      title="Editar"
                      disabled={isRemoving}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleDeleteClick(t)}
                      disabled={isRemoving}
                      aria-busy={isRemoving}
                      aria-label="Remover"
                      title={t.installmentGroupId ? 'Remover parcela(s)' : 'Remover'}
                    >
                      {isRemoving ? <Spinner /> : '×'}
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {editingTransaction && (
        <Modal title="Editar transação" onClose={() => setEditingTransaction(null)}>
          <TransactionForm
            categories={categories}
            wallets={wallets}
            initialValues={editingTransaction}
            onSubmit={async (input) => {
              await onUpdate(editingTransaction.id, input);
              setEditingTransaction(null);
            }}
            onUpdateGroup={onUpdateGroup ? async (groupId, input) => {
              await onUpdateGroup(groupId, input);
              setEditingTransaction(null);
            } : undefined}
            onCancel={() => setEditingTransaction(null)}
          />
        </Modal>
      )}
    </>
  );
}
