import { TransactionType, type TransactionDto } from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../hooks/useTransactions';

interface MonthSummary {
  key: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
  isSurplus: boolean;
}

function getMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

function computeGoalProgress(transactions: TransactionDto[]): {
  streak: number;
  achieved: boolean;
  months: MonthSummary[];
} {
  const byMonth = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth.has(key)) byMonth.set(key, { income: 0, expense: 0 });
    const entry = byMonth.get(key)!;
    if (t.type === TransactionType.INCOME) entry.income += Number(t.amount);
    else entry.expense += Number(t.amount);
  }

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const sorted = Array.from(byMonth.entries())
    .filter(([key]) => key < currentMonthKey)
    .sort(([a], [b]) => b.localeCompare(a));

  const months: MonthSummary[] = sorted.slice(0, 6).map(([key, { income, expense }]) => ({
    key,
    label: getMonthLabel(key),
    income,
    expense,
    balance: income - expense,
    isSurplus: income > expense,
  }));

  let streak = 0;
  for (const m of months) {
    if (m.isSurplus) streak++;
    else break;
  }

  return { streak, achieved: streak >= 2, months };
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const TARGET = 2;

export function GoalsPage() {
  const { activeAccount } = useAccounts();
  const accountId = activeAccount?.id ?? null;
  const { transactions, isLoading } = useTransactions(accountId);

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  const { streak, achieved, months } = computeGoalProgress(transactions);
  const progress = Math.min(streak, TARGET);

  return (
    <div>
      <div className="page-header">
        <h2>Objetivos</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      {isLoading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <div className={`goal-card${achieved ? ' goal-achieved' : ''}`}>
          {achieved && (
            <div className="goal-confetti" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="goal-confetti-piece" style={{ '--i': i } as React.CSSProperties} />
              ))}
            </div>
          )}

          <div className="goal-header">
            <div className={`goal-icon-wrap${achieved ? ' achieved' : ''}`}>
              <span className="goal-icon-star">★</span>
            </div>
            <div className="goal-info">
              <h3 className="goal-title">Superávit por 2 meses consecutivos</h3>
              <p className="goal-description">
                Gaste menos do que ganha por 2 meses seguidos
              </p>
            </div>
            {achieved && <span className="goal-badge-done">Concluído</span>}
          </div>

          {achieved && (
            <div className="goal-reward">
              <div className="goal-reward-trophy">
                <span>★</span>
              </div>
              <div className="goal-reward-text">
                <p className="goal-reward-title">Parabéns! Objetivo conquistado!</p>
                <p className="goal-reward-desc">
                  Você manteve superávit por {streak} {streak === 1 ? 'mês' : 'meses'} consecutivos.
                  Sua disciplina financeira está dando resultados — continue assim!
                </p>
              </div>
            </div>
          )}

          <div className="goal-progress-section">
            <div className="goal-progress-bar-wrap">
              <div
                className="goal-progress-bar-fill"
                style={{ width: `${(progress / TARGET) * 100}%` }}
              />
            </div>
            <span className="goal-progress-label">
              {progress} de {TARGET} {progress === 1 ? 'mês' : 'meses'}
            </span>
          </div>

          {months.length > 0 ? (
            <div className="goal-months">
              <p className="goal-months-title">Histórico de meses completos</p>
              {months.map((m, idx) => (
                <div key={m.key} className={`goal-month${m.isSurplus ? ' surplus' : ' deficit'}${idx === 0 && m.isSurplus ? ' most-recent-surplus' : ''}`}>
                  <span className="goal-month-arrow">{m.isSurplus ? '▲' : '▼'}</span>
                  <span className="goal-month-label">{m.label}</span>
                  <div className="goal-month-values">
                    <span className="goal-month-detail">
                      +{formatBRL(m.income)} / -{formatBRL(m.expense)}
                    </span>
                    <span className={`goal-month-balance ${m.isSurplus ? 'positive' : 'negative'}`}>
                      {m.isSurplus ? '+' : ''}{formatBRL(m.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted goal-empty">
              Sem meses completos ainda. Adicione transações para acompanhar seu progresso.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
