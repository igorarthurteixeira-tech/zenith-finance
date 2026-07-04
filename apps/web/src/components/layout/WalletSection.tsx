import { useState, type FormEvent } from 'react';
import { useAccounts } from '../../context/AccountContext';
import { useWallets } from '../../hooks/useWallets';
import { Spinner } from '../ui/Spinner';
import { useAsyncAction, useAsyncSet } from '../../hooks/useAsyncAction';

export function WalletSection() {
  const { activeAccount } = useAccounts();
  const { wallets, create, remove } = useWallets(activeAccount?.id ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const { isPending: isCreatingWallet, run: runCreate } = useAsyncAction();
  const { pendingIds: removingIds, run: runRemove } = useAsyncSet();

  if (!activeAccount) return null;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await runCreate(async () => {
      await create({ name: newName });
      setNewName('');
      setIsCreating(false);
    });
  }

  return (
    <div className="sidebar-wallet-section">
      <p className="sidebar-section-title">Contas</p>

      {wallets.length > 0 && (
        <ul className="sidebar-wallet-list">
          {wallets.map((w) => (
            <li key={w.id} className="sidebar-wallet-item">
              <span className="sidebar-wallet-dot" />
              <span className="sidebar-wallet-name">{w.name}</span>
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

      {isCreating ? (
        <form onSubmit={handleCreate} className="sidebar-wallet-form">
          <input
            className="input-sm sidebar-input"
            placeholder="Ex: Carteira, C6 Bank…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            disabled={isCreatingWallet}
          />
          <div className="sidebar-wallet-form-actions">
            <button type="submit" className="btn-primary btn-sm" disabled={isCreatingWallet} aria-busy={isCreatingWallet}>
              {isCreatingWallet ? <><Spinner /> Criando…</> : 'Criar'}
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setIsCreating(false)} disabled={isCreatingWallet}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="sidebar-wallet-add" onClick={() => setIsCreating(true)}>
          + Nova conta
        </button>
      )}
    </div>
  );
}
