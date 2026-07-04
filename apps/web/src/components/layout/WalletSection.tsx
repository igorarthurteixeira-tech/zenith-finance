import { useState, type FormEvent } from 'react';
import { useAccounts } from '../../context/AccountContext';
import { useWallets } from '../../hooks/useWallets';

export function WalletSection() {
  const { activeAccount } = useAccounts();
  const { wallets, create, remove } = useWallets(activeAccount?.id ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  if (!activeAccount) return null;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await create({ name: newName });
    setNewName('');
    setIsCreating(false);
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
                onClick={() => remove(w.id)}
                aria-label="Remover conta"
              >
                ×
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
          />
          <div className="sidebar-wallet-form-actions">
            <button type="submit" className="btn-primary btn-sm">Criar</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setIsCreating(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="sidebar-wallet-add"
          onClick={() => setIsCreating(true)}
        >
          + Nova conta
        </button>
      )}
    </div>
  );
}
