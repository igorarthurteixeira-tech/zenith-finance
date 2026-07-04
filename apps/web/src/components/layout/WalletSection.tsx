import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { WalletType } from '@zenith/shared';
import { useAccounts } from '../../context/AccountContext';
import { useWallets } from '../../hooks/useWallets';
import { Spinner } from '../ui/Spinner';
import { Modal } from '../ui/Modal';
import { useAsyncAction, useAsyncSet } from '../../hooks/useAsyncAction';

export function WalletSection() {
  const { activeAccount } = useAccounts();
  const { wallets, create, remove } = useWallets(activeAccount?.id ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>(WalletType.CONTA);
  const [initialBalance, setInitialBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const { isPending: isCreatingWallet, run: runCreate } = useAsyncAction();
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

  function resetForm() {
    setName('');
    setType(WalletType.CONTA);
    setInitialBalance('');
    setCreditLimit('');
    setClosingDay('');
    setDueDay('');
    setIsCreating(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await runCreate(async () => {
      await create({
        name,
        type,
        initialBalance: initialBalance || undefined,
        ...(type === WalletType.CARTAO_CREDITO && {
          creditLimit: creditLimit || undefined,
          closingDay: closingDay ? Number(closingDay) : undefined,
          dueDay: dueDay ? Number(dueDay) : undefined,
        }),
      });
      resetForm();
    });
  }

  return (
    <div className="sidebar-wallet-section">
      <p className="sidebar-section-title">Contas</p>

      {wallets.length > 0 && (
        <ul className="sidebar-wallet-list">
          {wallets.map((w) => (
            <li key={w.id} className={`sidebar-wallet-item${activeWalletId === w.id ? ' active' : ''}`}>
              <button
                type="button"
                className="sidebar-wallet-name-btn"
                onClick={() => handleWalletClick(w.id)}
                title={activeWalletId === w.id ? 'Ver todas as transações' : `Filtrar por ${w.name}`}
              >
                <span className="sidebar-wallet-dot" />
                <span className="sidebar-wallet-name">
                  {w.name}
                  {w.type === WalletType.CARTAO_CREDITO && ' 💳'}
                </span>
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

      <button type="button" className="sidebar-wallet-add" onClick={() => setIsCreating(true)}>
        + Nova conta
      </button>

      {isCreating && (
        <Modal title="Nova conta" onClose={resetForm}>
          <form onSubmit={handleCreate} className="inline-form">
            <input
              placeholder="Ex: Carteira, C6 Bank, Nubank Roxinho…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={isCreatingWallet}
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value as WalletType)}
              disabled={isCreatingWallet}
            >
              <option value={WalletType.CONTA}>Conta</option>
              <option value={WalletType.CARTAO_CREDITO}>Cartão de crédito</option>
            </select>

            <label className="input-label">
              Saldo inicial (positivo) ou dívida já existente (negativo)
              <input
                placeholder="Ex: 500 ou -150"
                type="number"
                step="0.01"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                disabled={isCreatingWallet}
              />
            </label>

            {type === WalletType.CARTAO_CREDITO && (
              <>
                <input
                  placeholder="Limite do cartão (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  disabled={isCreatingWallet}
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
                    disabled={isCreatingWallet}
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
                    disabled={isCreatingWallet}
                  />
                </label>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={isCreatingWallet} aria-busy={isCreatingWallet}>
              {isCreatingWallet ? <><Spinner /> Criando…</> : 'Criar conta'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
