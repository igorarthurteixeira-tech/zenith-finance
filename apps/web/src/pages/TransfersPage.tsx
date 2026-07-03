import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccounts } from '../context/AccountContext';
import { transfersApi } from '../api/transfers';
import { ApiError } from '../api/client';

export function TransfersPage() {
  const { accounts, activeAccount } = useAccounts();
  const queryClient = useQueryClient();
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const otherAccounts = accounts.filter((a) => a.id !== activeAccount?.id);

  const transfersQuery = useQuery({
    queryKey: ['transfers', activeAccount?.id],
    queryFn: () => transfersApi.list(activeAccount!.id),
    enabled: !!activeAccount,
  });

  const createMutation = useMutation({
    mutationFn: transfersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers', activeAccount?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setAmount('');
      setDescription('');
    },
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!activeAccount || !toAccountId || !amount) return;
    try {
      await createMutation.mutateAsync({
        fromAccountId: activeAccount.id,
        toAccountId,
        amount,
        description: description || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao transferir');
    }
  }

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  return (
    <div>
      <h2>Transferências — {activeAccount.name}</h2>

      {otherAccounts.length === 0 ? (
        <p>Crie outra conta para poder transferir entre elas.</p>
      ) : (
        <form onSubmit={handleSubmit} className="inline-form">
          <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
            <option value="">Para qual conta?</option>
            {otherAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Valor"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" disabled={createMutation.isPending}>
            Transferir
          </button>
        </form>
      )}
      {error && <p className="error">{error}</p>}

      <h3>Histórico</h3>
      {transfersQuery.isLoading ? (
        <p>Carregando...</p>
      ) : transfersQuery.data && transfersQuery.data.length > 0 ? (
        <ul className="transaction-list">
          {transfersQuery.data.map((transfer) => (
            <li key={transfer.id}>
              <span>{new Date(transfer.createdAt).toLocaleDateString('pt-BR')}</span>
              <span>
                {transfer.fromAccountId === activeAccount.id ? 'Enviado' : 'Recebido'}
              </span>
              <span>
                {Number(transfer.amount).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma transferência ainda.</p>
      )}
    </div>
  );
}
