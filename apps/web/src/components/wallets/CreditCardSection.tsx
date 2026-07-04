import { useState } from 'react';
import {
  TransactionType,
  WalletType,
  currentOpenInvoicePeriod,
  periodOfDate,
  type WalletDto,
  type TransactionDto,
  type CreateWalletInput,
  type UpdateWalletInput,
} from '@zenith/shared';
import { CardFormModal, type CardFormValues } from './CardFormModal';

interface CreditCardSectionProps {
  account: WalletDto;
  cards: WalletDto[];
  transactions: TransactionDto[];
  onCreateCard: (input: CreateWalletInput) => Promise<unknown>;
  onUpdateCard: (walletId: string, input: UpdateWalletInput) => Promise<unknown>;
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
  onUpdateCard,
  onSelectCard,
}: CreditCardSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCard, setEditingCard] = useState<WalletDto | null>(null);

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
            const openPeriod = currentOpenInvoicePeriod(card.closingDay);
            const currentPeriodTransactions = transactions.filter((t) => {
              if (t.walletId !== card.id) return false;
              const effectivePeriod = t.invoicePeriod ?? periodOfDate(new Date(t.date));
              return effectivePeriod === openPeriod;
            });
            const income = currentPeriodTransactions
              .filter((t) => t.type === TransactionType.INCOME && t.countsInTotal)
              .reduce((sum, t) => sum + Number(t.amount), 0);
            const expense = currentPeriodTransactions
              .filter((t) => t.type === TransactionType.EXPENSE && t.countsInTotal)
              .reduce((sum, t) => sum + Number(t.amount), 0);
            // A fatura atual soma a dívida que já existia antes de usar o app
            // (initialBalance) com o líquido lançado no ciclo aberto agora.
            const preExistingDebt = Math.max(0, -Number(card.initialBalance));
            const debt = Math.max(0, preExistingDebt + expense - income);
            const limit = card.creditLimit ? Number(card.creditLimit) : null;

            return (
              <div key={card.id} className="credit-card-tile">
                <div className="credit-card-tile-header">
                  <span className="credit-card-tile-icon">💳</span>
                  <span className="credit-card-tile-name">{card.name}</span>
                  <button
                    type="button"
                    className="btn-icon credit-card-tile-edit"
                    onClick={() => setEditingCard(card)}
                    aria-label="Editar cartão"
                    title="Editar cartão"
                  >
                    ✎
                  </button>
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
        <CardFormModal
          title={`Novo cartão em ${account.name}`}
          submitLabel="Criar cartão"
          onSubmit={(values: CardFormValues) =>
            onCreateCard({
              ...values,
              type: WalletType.CARTAO_CREDITO,
              parentWalletId: account.id,
            })
          }
          onClose={() => setIsCreating(false)}
        />
      )}

      {editingCard && (
        <CardFormModal
          title={`Editar ${editingCard.name}`}
          submitLabel="Salvar"
          initialValues={{
            name: editingCard.name,
            debt: Math.max(0, -Number(editingCard.initialBalance)),
            creditLimit: editingCard.creditLimit ? Number(editingCard.creditLimit) : null,
            closingDay: editingCard.closingDay,
            dueDay: editingCard.dueDay,
          }}
          onSubmit={(values: CardFormValues) => onUpdateCard(editingCard.id, values)}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
