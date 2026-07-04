import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAccounts } from '../../context/AccountContext';
import { useWallets } from '../../hooks/useWallets';
import { Spinner } from '../ui/Spinner';
import { useAsyncAction, useAsyncSet } from '../../hooks/useAsyncAction';

export function WalletSection() {
  const { activeAccount } = useAccounts();
  const { wallets, create, remove } = useWallets(activeAccount?.id ?? null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
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

  return (
    <div className="sidebar-wallet-section">
      <p className="sidebar-section-title">Contas</p>

      {topLevelWallets.length > 0 && (
        <ul className="sidebar-wallet-list">
          {topLevelWallets.map((w) => (
            <li key={w.id} className={`sidebar-wallet-item${activeWalletId === w.id ? ' active' : ''}`}>
              <button
                type="button"
                className="sidebar-wallet-name-btn"
                onClick={() => handleWalletClick(w.id)}
                title={activeWalletId === w.id ? 'Ver todas as transações' : `Entrar em ${w.name}`}
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
            </li>
          ))}
        </ul>
      )}

      {isCreatingAccount ? (
        <NewAccountForm onCreate={create} onClose={() => setIsCreatingAccount(false)} />
      ) : (
        <button type="button" className="sidebar-wallet-add" onClick={() => setIsCreatingAccount(true)}>
          + Nova conta
        </button>
      )}
    </div>
  );
}

interface NewAccountFormProps {
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
