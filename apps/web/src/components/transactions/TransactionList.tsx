import { TransactionType, type TransactionDto } from '@zenith/shared';
import { formatDateOnly } from '../../utils/formatDate';

interface TransactionListProps {
  transactions: TransactionDto[];
  onRemove: (transactionId: string) => void;
}

export function TransactionList({ transactions, onRemove }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="muted">Nenhuma transação ainda.</p>;
  }

  return (
    <ul className="transaction-list">
      {transactions.map((t) => (
        <li key={t.id}>
          <div className="transaction-info">
            <span className="transaction-description">{t.description}</span>
            <span className="transaction-date">{formatDateOnly(t.date)}</span>
          </div>
          <span className={t.type === TransactionType.INCOME ? 'positive' : 'negative'}>
            {t.type === TransactionType.INCOME ? '+' : '-'}
            {Number(t.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <button type="button" className="btn-icon" onClick={() => onRemove(t.id)} aria-label="Remover">
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
