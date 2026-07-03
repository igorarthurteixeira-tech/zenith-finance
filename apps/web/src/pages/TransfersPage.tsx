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
      <div className="page-header">
        <h2>Transferências</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      <div className="card">
        {otherAccounts.length === 0 ? (
          <p className="muted">Crie outra conta para poder transferir entre elas.</p>
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
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              Transferir
            </button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h3 className="card-title">Histórico</h3>
        {transfersQuery.isLoading ? (
          <p className="muted">Carregando...</p>
        ) : transfersQuery.data && transfersQuery.data.length > 0 ? (
          <ul className="transaction-list">
            {transfersQuery.data.map((transfer) => (
              <li key={transfer.id}>
                <div className="transaction-info">
                  <span className="transaction-description">
                    {transfer.fromAccountId === activeAccount.id ? 'Enviado' : 'Recebido'}
                  </span>
                  <span className="transaction-date">
                    {new Date(transfer.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
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
          <p className="muted">Nenhuma transferência ainda.</p>
        )}
      </div>
    </div>
  );
}
