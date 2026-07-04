import { useState, useEffect, type FormEvent } from 'react';
import { TransactionType, type CategoryDto, type WalletDto, type TransactionDto } from '@zenith/shared';

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
}

export function TransactionForm({ categories, wallets, onSubmit, onCancel, initialValues }: TransactionFormProps) {
  const isEditing = !!initialValues;

  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? TransactionType.EXPENSE);
  const [date, setDate] = useState(() =>
    initialValues ? initialValues.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [walletId, setWalletId] = useState(initialValues?.walletId ?? (wallets[0]?.id ?? ''));

  useEffect(() => {
    if (initialValues) {
      setDescription(initialValues.description);
      setAmount(initialValues.amount);
      setType(initialValues.type);
      setDate(initialValues.date.slice(0, 10));
      setCategoryId(initialValues.categoryId ?? '');
      setWalletId(initialValues.walletId ?? wallets[0]?.id ?? '');
    }
  }, [initialValues, wallets]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim() || !amount || !walletId) return;
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
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        placeholder="Valor"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
        <option value={TransactionType.EXPENSE}>Despesa</option>
        <option value={TransactionType.INCOME}>Receita</option>
      </select>
      <select
        value={walletId}
        onChange={(e) => setWalletId(e.target.value)}
        required
        style={!walletId ? { borderColor: 'var(--color-negative)' } : undefined}
      >
        {wallets.length === 0 && <option value="">Nenhuma conta cadastrada</option>}
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Sem categoria</option>
        {filteredCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="submit">{isEditing ? 'Salvar' : 'Adicionar'}</button>
      {onCancel && (
        <button type="button" className="btn-ghost btn-sm" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}
