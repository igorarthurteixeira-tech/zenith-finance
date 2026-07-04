import { useState, useEffect, type FormEvent } from 'react';
import { TransactionType, type CategoryDto, type WalletDto, type TransactionDto } from '@zenith/shared';
import { Spinner } from '../ui/Spinner';
import { useAsyncAction } from '../../hooks/useAsyncAction';

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface TransactionFormProps {
  categories: CategoryDto[];
  wallets: WalletDto[];
  onSubmit: (input: {
    description: string;
    amount: string;
    type: TransactionType;
    date: string;
    categoryId?: string;
    walletId: string;
  }) => Promise<unknown>;
  onCancel?: () => void;
  initialValues?: TransactionDto;
  defaultWalletId?: string;
}

export function TransactionForm({
  categories,
  wallets,
  onSubmit,
  onCancel,
  initialValues,
  defaultWalletId,
}: TransactionFormProps) {
  const isEditing = !!initialValues;
  const { isPending, run } = useAsyncAction();

  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? TransactionType.EXPENSE);
  const [date, setDate] = useState(() =>
    initialValues ? toDatetimeLocalValue(new Date(initialValues.date)) : toDatetimeLocalValue(new Date()),
  );
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [walletId, setWalletId] = useState(
    initialValues?.walletId ?? defaultWalletId ?? (wallets[0]?.id ?? ''),
  );

  useEffect(() => {
    if (initialValues) {
      setDescription(initialValues.description);
      setAmount(initialValues.amount);
      setType(initialValues.type);
      setDate(toDatetimeLocalValue(new Date(initialValues.date)));
      setCategoryId(initialValues.categoryId ?? '');
      setWalletId(initialValues.walletId ?? wallets[0]?.id ?? '');
    }
  }, [initialValues, wallets]);

  useEffect(() => {
    if (!isEditing && defaultWalletId) {
      setWalletId(defaultWalletId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultWalletId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim() || !amount || !walletId) return;
    await run(async () => {
      await onSubmit({
        description,
        amount,
        type,
        date: new Date(date).toISOString(),
        categoryId: categoryId || undefined,
        walletId,
      });
      if (!isEditing) {
        setDescription('');
        setAmount('');
      }
    });
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isPending}
      />
      <input
        placeholder="Valor"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isPending}
      />
      <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} disabled={isPending}>
        <option value={TransactionType.EXPENSE}>Despesa</option>
        <option value={TransactionType.INCOME}>Receita</option>
      </select>
      <select
        value={walletId}
        onChange={(e) => setWalletId(e.target.value)}
        required
        disabled={isPending}
        style={!walletId ? { borderColor: 'var(--color-negative)' } : undefined}
      >
        {wallets.length === 0 && <option value="">Nenhuma conta cadastrada</option>}
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={isPending}>
        <option value="">Sem categoria</option>
        {filteredCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} disabled={isPending} />
      <button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending
          ? <><Spinner /> {isEditing ? 'Salvando…' : 'Adicionando…'}</>
          : isEditing ? 'Salvar' : 'Adicionar'}
      </button>
      {onCancel && (
        <button type="button" className="btn-ghost btn-sm" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
      )}
    </form>
  );
}
