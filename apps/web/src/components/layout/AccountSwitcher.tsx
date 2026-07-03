import { useState, type FormEvent } from 'react';
import { AccountType } from '@zenith/shared';
import { useAccounts } from '../../context/AccountContext';

export function AccountSwitcher() {
  const { accounts, activeAccount, setActiveAccountId, createAccount } =
    useAccounts();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>(AccountType.PESSOAL);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    await createAccount({ name: newName, type: newType });
    setNewName('');
    setIsCreating(false);
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

      {isCreating ? (
        <form onSubmit={handleCreate} className="account-switcher-form">
          <input
            className="input-sm"
            placeholder="Nome da conta"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <select
            className="input-sm"
            value={newType}
            onChange={(e) => setNewType(e.target.value as AccountType)}
          >
            <option value={AccountType.PESSOAL}>Pessoal</option>
            <option value={AccountType.EMPRESARIAL}>Empresarial</option>
          </select>
          <button type="submit" className="btn-primary btn-sm">
            Criar
          </button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => setIsCreating(false)}
          >
            Cancelar
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => setIsCreating(true)}
        >
          + Nova conta
        </button>
      )}
    </div>
  );
}
