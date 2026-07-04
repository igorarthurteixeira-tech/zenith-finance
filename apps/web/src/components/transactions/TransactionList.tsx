import { useState } from 'react';
import { TransactionType, type TransactionDto, type CategoryDto, type WalletDto } from '@zenith/shared';
import { TransactionForm } from './TransactionForm';
import { formatDateOnly } from '../../utils/formatDate';

interface TransactionListProps {
  transactions: TransactionDto[];
  categories: CategoryDto[];
  wallets: WalletDto[];
  onRemove: (transactionId: string) => void;
  onUpdate: (transactionId: string, input: Partial<TransactionDto>) => Promise<unknown>;
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
      const totalIncome = txs.filter((t) => t.type === TransactionType.INCOME).reduce((s, t) => s + Number(t.amount), 0);
      const totalExpense = txs.filter((t) => t.type === TransactionType.EXPENSE).reduce((s, t) => s + Number(t.amount), 0);
      return { key, label: getPeriodLabel(key, mode), transactions: txs, totalIncome, totalExpense };
    });
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function TransactionList({ transactions, categories, wallets, onRemove, onUpdate, viewMode }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return <p className="muted">Nenhuma transação ainda.</p>;
  }

  const groups = groupTransactions(transactions, viewMode);

  return (
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
                {editingId === t.id ? (
                  <div className="transaction-edit-form">
                    <TransactionForm
                      categories={categories}
                      wallets={wallets}
                      initialValues={t}
                      onSubmit={async (input) => {
                        await onUpdate(t.id, input);
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="transaction-info">
                      <span className="transaction-description">{t.description}</span>
                      <span className="transaction-date">{formatDateOnly(t.date)}</span>
                      {wallets.find((w) => w.id === t.walletId) && (
                        <span className="transaction-wallet">
                          {wallets.find((w) => w.id === t.walletId)?.name}
                        </span>
                      )}
                    </div>
                    <span className={t.type === TransactionType.INCOME ? 'positive' : 'negative'}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}
                      {formatBRL(Number(t.amount))}
                    </span>
                    <div className="transaction-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setEditingId(t.id)}
                        aria-label="Editar"
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => onRemove(t.id)}
                        aria-label="Remover"
                        title="Remover"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
