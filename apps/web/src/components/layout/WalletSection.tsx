import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { WalletType, type WalletDto } from '@zenith/shared';
import { useAccounts } from '../../context/AccountContext';
import { useWallets } from '../../hooks/useWallets';
import { Spinner } from '../ui/Spinner';
import { Modal } from '../ui/Modal';
import { useAsyncAction, useAsyncSet } from '../../hooks/useAsyncAction';

export function WalletSection() {
  const { activeAccount } = useAccounts();
  const { wallets, create, remove } = useWallets(activeAccount?.id ?? null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [cardParent, setCardParent] = useState<WalletDto | null>(null);
  const { pendingIds: removingIds, run: runRemove } = useAsyncSet();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isOnTransactions = location.pathname === '/transactions';
  const activeWalletId = isOnTransactions ? searchParams.get('walletId') : null;

  if (!activeAccount) return null;

  function handleWalletClick(walletId: string) {
    if (activeWalletId === walletId) {
      navigate('/transactions');
    } else {
      navigate(`/transactions?walletId=${walletId}`);
    }
  }

  const topLevelWallets = wallets.filter((w) => !w.parentWalletId);
  const cardsByParent = new Map<string, WalletDto[]>();
  for (const w of wallets) {
    if (w.parentWalletId) {
      cardsByParent.set(w.parentWalletId, [...(cardsByParent.get(w.parentWalletId) ?? []), w]);
    }
  }

  return (
    <div className="sidebar-wallet-section">
      <p className="sidebar-section-title">Contas</p>

      {topLevelWallets.length > 0 && (
        <ul className="sidebar-wallet-list">
          {topLevelWallets.map((w) => (
            <li key={w.id} className="sidebar-wallet-group">
              <div className={`sidebar-wallet-item${activeWalletId === w.id ? ' active' : ''}`}>
                <button
                  type="button"
                  className="sidebar-wallet-name-btn"
                  onClick={() => handleWalletClick(w.id)}
                  title={activeWalletId === w.id ? 'Ver todas as transações' : `Filtrar por ${w.name}`}
                >
                  <span className="sidebar-wallet-dot" />
                  <span className="sidebar-wallet-name">{w.name}</span>
                </button>
                <button
                  type="button"
                  className="btn-icon sidebar-wallet-remove"
                  onClick={() => runRemove(w.id, () => remove(w.id))}
                  disabled={removingIds.has(w.id)}
                  aria-busy={removingIds.has(w.id)}
                  aria-label="Remover conta"
                >
                  {removingIds.has(w.id) ? <Spinner /> : '×'}
                </button>
              </div>

              {(cardsByParent.get(w.id) ?? []).map((card) => (
                <div
                  key={card.id}
                  className={`sidebar-wallet-item sidebar-wallet-card${activeWalletId === card.id ? ' active' : ''}`}
                >
                  <button
                    type="button"
                    className="sidebar-wallet-name-btn"
                    onClick={() => handleWalletClick(card.id)}
                    title={activeWalletId === card.id ? 'Ver todas as transações' : `Filtrar por ${card.name}`}
                  >
                    <span className="sidebar-wallet-dot" />
                    <span className="sidebar-wallet-name">💳 {card.name}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon sidebar-wallet-remove"
                    onClick={() => runRemove(card.id, () => remove(card.id))}
                    disabled={removingIds.has(card.id)}
                    aria-busy={removingIds.has(card.id)}
                    aria-label="Remover cartão"
                  >
                    {removingIds.has(card.id) ? <Spinner /> : '×'}
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="sidebar-wallet-add-card"
                onClick={() => setCardParent(w)}
              >
                + Cartão em {w.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isCreatingAccount ? (
        <NewAccountForm
          isCreating={isCreatingAccount}
          onCreate={create}
          onClose={() => setIsCreatingAccount(false)}
        />
      ) : (
        <button type="button" className="sidebar-wallet-add" onClick={() => setIsCreatingAccount(true)}>
          + Nova conta
        </button>
      )}

      {cardParent && (
        <NewCardModal
          parent={cardParent}
          onCreate={create}
          onClose={() => setCardParent(null)}
        />
      )}
    </div>
  );
}

interface NewAccountFormProps {
  isCreating: boolean;
  onCreate: ReturnType<typeof useWallets>['create'];
  onClose: () => void;
}

function NewAccountForm({ onCreate, onClose }: NewAccountFormProps) {
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const { isPending, run } = useAsyncAction();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await run(async () => {
      await onCreate({ name, initialBalance: initialBalance || undefined });
      onClose();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="sidebar-wallet-form">
      <input
        className="input-sm sidebar-input"
        placeholder="Ex: Carteira, C6 Bank…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        disabled={isPending}
      />
      <input
        className="input-sm sidebar-input"
        placeholder="Saldo inicial (opcional)"
        type="number"
        step="0.01"
        value={initialBalance}
        onChange={(e) => setInitialBalance(e.target.value)}
        disabled={isPending}
      />
      <div className="sidebar-wallet-form-actions">
        <button type="submit" className="btn-primary btn-sm" disabled={isPending} aria-busy={isPending}>
          {isPending ? <><Spinner /> Criando…</> : 'Criar'}
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={onClose} disabled={isPending}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

interface NewCardModalProps {
  parent: WalletDto;
  onCreate: ReturnType<typeof useWallets>['create'];
  onClose: () => void;
}

function NewCardModal({ parent, onCreate, onClose }: NewCardModalProps) {
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const { isPending, run } = useAsyncAction();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await run(async () => {
      await onCreate({
        name,
        type: WalletType.CARTAO_CREDITO,
        parentWalletId: parent.id,
        initialBalance: initialBalance || undefined,
        creditLimit: creditLimit || undefined,
        closingDay: closingDay ? Number(closingDay) : undefined,
        dueDay: dueDay ? Number(dueDay) : undefined,
      });
      onClose();
    });
  }

  return (
    <Modal title={`Novo cartão em ${parent.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="inline-form">
        <input
          placeholder="Ex: Cartão físico, Virtual 1…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          disabled={isPending}
        />
        <label className="input-label">
          Fatura em aberto (dívida já existente, se houver)
          <input
            placeholder="Ex: -350"
            type="number"
            step="0.01"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            disabled={isPending}
          />
        </label>
        <input
          placeholder="Limite do cartão (R$)"
          type="number"
          step="0.01"
          min="0"
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          disabled={isPending}
        />
        <label className="input-label">
          Dia de fechamento da fatura
          <input
            placeholder="Ex: 20"
            type="number"
            min="1"
            max="31"
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
            disabled={isPending}
          />
        </label>
        <label className="input-label">
          Dia de vencimento da fatura
          <input
            placeholder="Ex: 27"
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            disabled={isPending}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={isPending} aria-busy={isPending}>
          {isPending ? <><Spinner /> Criando…</> : 'Criar cartão'}
        </button>
      </form>
    </Modal>
  );
}
