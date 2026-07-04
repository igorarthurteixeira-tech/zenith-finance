import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { SpendingHistoryChart } from '../components/charts/SpendingHistoryChart';

export function GraphsPage() {
  const { activeAccount } = useAccounts();
  const accountId = activeAccount?.id ?? null;
  const { transactions, isLoading } = useTransactions(accountId);
  const { wallets } = useWallets(accountId);

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Gráficos</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      {isLoading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <SpendingHistoryChart transactions={transactions} wallets={wallets} />
      )}
    </div>
  );
}
