import { useState } from 'react';
import { TransactionType, type WalletDto, type TransactionDto, type CreateWalletInput } from '@zenith/shared';
import { NewCardModal } from './NewCardModal';

interface CreditCardSectionProps {
  account: WalletDto;
  cards: WalletDto[];
  transactions: TransactionDto[];
  onCreateCard: (input: CreateWalletInput) => Promise<unknown>;
  onSelectCard: (walletId: string) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CreditCardSection({
  account,
  cards,
  transactions,
  onCreateCard,
  onSelectCard,
}: CreditCardSectionProps) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="card">
      <div className="chart-header">
        <h3 className="card-title">Cartões de {account.name}</h3>
        <button type="button" className="btn-ghost btn-sm" onClick={() => setIsCreating(true)}>
          + Novo cartão
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="muted">Nenhum cartão cadastrado nessa conta ainda.</p>
      ) : (
        <div className="credit-card-grid">
          {cards.map((card) => {
            const cardTransactions = transactions.filter((t) => t.walletId === card.id);
            const income = cardTransactions
              .filter((t) => t.type === TransactionType.INCOME)
              .reduce((sum, t) => sum + Number(t.amount), 0);
            const expense = cardTransactions
              .filter((t) => t.type === TransactionType.EXPENSE)
              .reduce((sum, t) => sum + Number(t.amount), 0);
            const cardBalance = Number(card.initialBalance) + income - expense;
            const debt = Math.max(0, -cardBalance);
            const limit = card.creditLimit ? Number(card.creditLimit) : null;

            return (
              <div key={card.id} className="credit-card-tile">
                <div className="credit-card-tile-header">
                  <span className="credit-card-tile-icon">💳</span>
                  <span className="credit-card-tile-name">{card.name}</span>
                </div>
                <div className="credit-card-tile-body">
                  <span className="stat-label">Fatura atual</span>
                  <span className="stat-value negative">{formatCurrency(debt)}</span>
                  {limit !== null && (
                    <span className="muted credit-card-tile-limit">
                      Limite: {formatCurrency(limit)}
                    </span>
                  )}
                  {(card.closingDay || card.dueDay) && (
                    <span className="muted credit-card-tile-dates">
                      {card.closingDay && `Fecha dia ${card.closingDay}`}
                      {card.closingDay && card.dueDay && ' · '}
                      {card.dueDay && `Vence dia ${card.dueDay}`}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-secondary btn-sm credit-card-tile-action"
                  onClick={() => onSelectCard(card.id)}
                >
                  Ver fatura
                </button>
              </div>
            );
          })}
        </div>
      )}

      {isCreating && (
        <NewCardModal
          parent={account}
          onCreate={onCreateCard}
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}
