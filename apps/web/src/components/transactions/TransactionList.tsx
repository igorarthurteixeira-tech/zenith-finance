import { useState } from 'react';
import { TransactionType, type TransactionDto, type CategoryDto, type WalletDto, type UpdateTransactionInput } from '@zenith/shared';
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
  onRemoveGroup?: (installmentGroupId: string) => Promise<unknown>;
  onUpdate: (transactionId: string, input: UpdateTransactionInput) => Promise<unknown>;
  viewMode: ViewMode;
}

export type ViewMode = 'monthly' | 'quarterly' | 'semester' | 'annual';

interface MonthGroup {
  label: string;
  key: string;
  transactions: TransactionDto[];
  totalIncome: number;
  totalExpense: number;
}

function getPeriodKey(date: Date, mode: ViewMode): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  if (mode === 'monthly') return `${y}-${String(m).padStart(2, '0')}`;
  if (mode === 'quarterly') return `${y}-Q${Math.floor(m / 3) + 1}`;
  if (mode === 'semester') return `${y}-S${Math.floor(m / 6) + 1}`;
  return `${y}`;
}

function getPeriodLabel(key: string, mode: ViewMode): string {
  if (mode === 'monthly') {
    const [y, m] = key.split('-');
    const date = new Date(Number(y), Number(m), 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
  if (mode === 'quarterly') {
    const [y, q] = key.split('-');
    return `${q}º Trimestre de ${y}`;
  }
  if (mode === 'semester') {
    const [y, s] = key.split('-');
    return `${s.replace('S', '')}º Semestre de ${y}`;
  }
  return `Ano ${key}`;
}

function groupTransactions(transactions: TransactionDto[], mode: ViewMode): MonthGroup[] {
  const map = new Map<string, TransactionDto[]>();

  for (const t of transactions) {
    const date = new Date(t.date);
    const key = getPeriodKey(date, mode);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, txs]) => {
      const totalIncome = txs
        .filter((t) => t.type === TransactionType.INCOME && t.countsInTotal)
        .reduce((s, t) => s + Number(t.amount), 0);
      const totalExpense = txs
        .filter((t) => t.type === TransactionType.EXPENSE && t.countsInTotal)
        .reduce((s, t) => s + Number(t.amount), 0);
      return { key, label: getPeriodLabel(key, mode), transactions: txs, totalIncome, totalExpense };
    });
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
  viewMode,
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | null>(null);
  const { pendingIds: removingIds, run: runRemove } = useAsyncSet();

  function handleRemoveGroup(installmentGroupId: string) {
    if (!onRemoveGroup) return;
    const confirmed = window.confirm(
      'Excluir todas as parcelas dessa compra parcelada? Essa ação não pode ser desfeita.',
    );
    if (!confirmed) return;
    runRemove(installmentGroupId, () => onRemoveGroup(installmentGroupId));
  }

  if (transactions.length === 0) {
    return <p className="muted">Nenhuma transação ainda.</p>;
  }

  const groups = groupTransactions(transactions, viewMode);

  return (
    <>
      <div className="timeline">
        {groups.map((group) => (
          <div key={group.key} className="timeline-group">
            <div className="timeline-header">
              <span className="timeline-period">{group.label}</span>
              <div className="timeline-summary">
                <span className="positive">+{formatBRL(group.totalIncome)}</span>
                <span className="negative">-{formatBRL(group.totalExpense)}</span>
                <span className={group.totalIncome - group.totalExpense >= 0 ? 'positive' : 'negative'}>
                  = {formatBRL(group.totalIncome - group.totalExpense)}
                </span>
              </div>
            </div>
            <ul className="transaction-list">
              {group.transactions.map((t) => (
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
                      <span className="transaction-badge" title="Já contabilizada em outro lugar — não soma no total">
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
                    <button
                      type="button"
                      className="btn-icon btn-icon-edit"
                      onClick={() => setEditingTransaction(t)}
                      aria-label="Editar"
                      title="Editar"
                    >
                      ✎
                    </button>
                    {t.installmentGroupId && onRemoveGroup && (
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleRemoveGroup(t.installmentGroupId!)}
                        disabled={removingIds.has(t.installmentGroupId)}
                        aria-busy={removingIds.has(t.installmentGroupId)}
                        aria-label="Excluir parcelamento inteiro"
                        title="Excluir parcelamento inteiro (todas as parcelas)"
                      >
                        {removingIds.has(t.installmentGroupId) ? <Spinner /> : '🗑'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => runRemove(t.id, () => onRemove(t.id))}
                      disabled={removingIds.has(t.id)}
                      aria-busy={removingIds.has(t.id)}
                      aria-label="Remover"
                      title="Remover apenas essa parcela"
                    >
                      {removingIds.has(t.id) ? <Spinner /> : '×'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

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
            onCancel={() => setEditingTransaction(null)}
          />
        </Modal>
      )}
    </>
  );
}
