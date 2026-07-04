import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useAsyncAction } from '../../hooks/useAsyncAction';

export interface CardFormValues {
  name: string;
  initialBalance?: string;
  creditLimit?: string;
  closingDay?: number;
  dueDay?: number;
}

interface CardFormModalProps {
  title: string;
  submitLabel: string;
  initialValues?: {
    name: string;
    debt?: number;
    creditLimit?: number | null;
    closingDay?: number | null;
    dueDay?: number | null;
  };
  onSubmit: (values: CardFormValues) => Promise<unknown>;
  onClose: () => void;
}

export function CardFormModal({ title, submitLabel, initialValues, onSubmit, onClose }: CardFormModalProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [debt, setDebt] = useState(
    initialValues?.debt !== undefined ? String(initialValues.debt) : '',
  );
  const [creditLimit, setCreditLimit] = useState(
    initialValues?.creditLimit != null ? String(initialValues.creditLimit) : '',
  );
  const [closingDay, setClosingDay] = useState(
    initialValues?.closingDay != null ? String(initialValues.closingDay) : '',
  );
  const [dueDay, setDueDay] = useState(
    initialValues?.dueDay != null ? String(initialValues.dueDay) : '',
  );
  const { isPending, run } = useAsyncAction();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await run(async () => {
      // O campo pede o valor da dívida como número positivo (quanto já se deve);
      // internamente isso vira saldo negativo, que é como o sistema representa dívida.
      const debtAmount = debt ? -Math.abs(Number(debt)) : undefined;
      await onSubmit({
        name,
        initialBalance: debtAmount !== undefined ? String(debtAmount) : undefined,
        creditLimit: creditLimit || undefined,
        closingDay: closingDay ? Number(closingDay) : undefined,
        dueDay: dueDay ? Number(dueDay) : undefined,
      });
      onClose();
    });
  }

  return (
    <Modal title={title} onClose={onClose}>
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
            value={debt}
            onChange={(e) => setDebt(e.target.value)}
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
          {isPending ? <><Spinner /> Salvando…</> : submitLabel}
        </button>
      </form>
    </Modal>
  );
}
