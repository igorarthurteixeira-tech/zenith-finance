import { useState, type FormEvent } from 'react';
import { AccountType } from '@zenith/shared';
import { useAccounts } from '../../context/AccountContext';
import { useWallets } from '../../hooks/useWallets';

export function AccountSwitcher() {
  const { accounts, activeAccount, setActiveAccountId, createAccount } = useAccounts();
  const { wallets, create: createWallet, remove: removeWallet } = useWallets(activeAccount?.id ?? null);

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<AccountType>(AccountType.PESSOAL);

  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');

  async function handleCreateAccount(event: FormEvent) {
    event.preventDefault();
    if (!newAccountName.trim()) return;
    await createAccount({ name: newAccountName, type: newAccountType });
    setNewAccountName('');
    setIsCreatingAccount(false);
  }

  async function handleCreateWallet(event: FormEvent) {
    event.preventDefault();
    if (!newWalletName.trim()) return;
    await createWallet({ name: newWalletName });
    setNewWalletName('');
    setIsCreatingWallet(false);
  }

  return (
    <div className="account-switcher">
      <div className="account-select-wrap">
        <select
          className="account-select"
          value={activeAccount?.id ?? ''}
          onChange={(e) => setActiveAccountId(e.target.value)}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {account.type === AccountType.PESSOAL ? 'Pessoal' : 'Empresarial'}
            </option>
          ))}
        </select>
      </div>

      {isCreatingAccount ? (
        <form onSubmit={handleCreateAccount} className="account-switcher-form">
          <input
            className="input-sm"
            placeholder="Nome do ambiente"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            autoFocus
          />
          <select
            className="input-sm"
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value as AccountType)}
          >
            <option value={AccountType.PESSOAL}>Pessoal</option>
            <option value={AccountType.EMPRESARIAL}>Empresarial</option>
          </select>
          <button type="submit" className="btn-primary btn-sm">Criar</button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setIsCreatingAccount(false)}>
            Cancelar
          </button>
        </form>
      ) : (
        <button type="button" className="btn-secondary btn-sm" onClick={() => setIsCreatingAccount(true)}>
          + Novo ambiente
        </button>
      )}

      {activeAccount && (
        <div className="wallet-section">
          <p className="wallet-section-title">Contas em {activeAccount.name}</p>
          {wallets.length > 0 && (
            <ul className="wallet-list">
              {wallets.map((w) => (
                <li key={w.id} className="wallet-item">
                  <span>{w.name}</span>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => removeWallet(w.id)}
                    aria-label="Remover conta"
                    title="Remover"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {isCreatingWallet ? (
            <form onSubmit={handleCreateWallet} className="account-switcher-form">
              <input
                className="input-sm"
                placeholder="Ex: Carteira, C6 Bank..."
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary btn-sm">Criar</button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setIsCreatingWallet(false)}>
                Cancelar
              </button>
            </form>
          ) : (
            <button type="button" className="btn-secondary btn-sm" onClick={() => setIsCreatingWallet(true)}>
              + Nova conta
            </button>
          )}
        </div>
      )}
    </div>
  );
}
