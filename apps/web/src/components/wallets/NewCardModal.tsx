import { useState, type FormEvent } from 'react';
import { WalletType, type WalletDto, type CreateWalletInput } from '@zenith/shared';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useAsyncAction } from '../../hooks/useAsyncAction';

interface NewCardModalProps {
  parent: WalletDto;
  onCreate: (input: CreateWalletInput) => Promise<unknown>;
  onClose: () => void;
}

export function NewCardModal({ parent, onCreate, onClose }: NewCardModalProps) {
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
      // O campo pede o valor da dívida como número positivo (quanto já se deve);
      // internamente isso vira saldo negativo, que é como o sistema representa dívida.
      const debtAmount = initialBalance ? -Math.abs(Number(initialBalance)) : undefined;
      await onCreate({
        name,
        type: WalletType.CARTAO_CREDITO,
        parentWalletId: parent.id,
        initialBalance: debtAmount !== undefined ? String(debtAmount) : undefined,
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
          Fatura em aberto (quanto você já deve, se houver)
          <input
            placeholder="Ex: 350"
            type="number"
            step="0.01"
            min="0"
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
