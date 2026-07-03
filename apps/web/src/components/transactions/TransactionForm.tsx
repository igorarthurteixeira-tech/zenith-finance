import { useState, type FormEvent } from 'react';
import { TransactionType, type CategoryDto } from '@zenith/shared';

interface TransactionFormProps {
  categories: CategoryDto[];
  onSubmit: (input: {
    description: string;
    amount: string;
    type: TransactionType;
    date: string;
    categoryId?: string;
  }) => Promise<unknown>;
}

export function TransactionForm({ categories, onSubmit }: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim() || !amount) return;
    await onSubmit({
      description,
      amount,
      type,
      date: new Date(date).toISOString(),
      categoryId: categoryId || undefined,
    });
    setDescription('');
    setAmount('');
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
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Sem categoria</option>
        {filteredCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="submit">Adicionar</button>
    </form>
  );
}
