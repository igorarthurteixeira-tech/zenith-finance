import { useState, type FormEvent } from 'react';
import { TransactionType } from '@zenith/shared';

interface CategoryFormProps {
  onSubmit: (name: string, type: TransactionType) => Promise<unknown>;
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name, type);
    setName('');
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        placeholder="Nome da categoria"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
        <option value={TransactionType.EXPENSE}>Despesa</option>
        <option value={TransactionType.INCOME}>Receita</option>
      </select>
      <button type="submit">Adicionar</button>
    </form>
  );
}
