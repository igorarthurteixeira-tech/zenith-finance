import { TransactionType, type TransactionDto } from '@zenith/shared';
import { formatDateOnly } from '../../utils/formatDate';

interface TransactionListProps {
  transactions: TransactionDto[];
  onRemove: (transactionId: string) => void;
}

export function TransactionList({ transactions, onRemove }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p>Nenhuma transação ainda.</p>;
  }

  return (
    <ul className="transaction-list">
      {transactions.map((t) => (
        <li key={t.id}>
          <span>{formatDateOnly(t.date)}</span>
          <span>{t.description}</span>
          <span className={t.type === TransactionType.INCOME ? 'positive' : 'negative'}>
            {t.type === TransactionType.INCOME ? '+' : '-'}
            {Number(t.amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <button type="button" onClick={() => onRemove(t.id)}>
            Remover
          </button>
        </li>
      ))}
    </ul>
  );
}
