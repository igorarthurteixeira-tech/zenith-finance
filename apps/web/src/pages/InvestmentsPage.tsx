import { useState, type FormEvent } from 'react';
import { InvestmentType, InvestmentLiquidity, type InvestmentDto } from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useInvestments } from '../hooks/useInvestments';

const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  [InvestmentType.CDB]: 'CDB',
  [InvestmentType.LCI]: 'LCI',
  [InvestmentType.LCA]: 'LCA',
  [InvestmentType.TESOURO_DIRETO]: 'Tesouro Direto',
  [InvestmentType.ACOES]: 'Ações',
  [InvestmentType.FII]: 'FII',
  [InvestmentType.CRIPTO]: 'Criptomoeda',
  [InvestmentType.OUTRO]: 'Outro',
};

const LIQUIDITY_LABELS: Record<InvestmentLiquidity, string> = {
  [InvestmentLiquidity.D0]: 'D+0 (imediato)',
  [InvestmentLiquidity.D1]: 'D+1',
  [InvestmentLiquidity.D2]: 'D+2',
  [InvestmentLiquidity.D30]: 'D+30',
  [InvestmentLiquidity.D60]: 'D+60',
  [InvestmentLiquidity.D90]: 'D+90',
  [InvestmentLiquidity.NO_VENCIMENTO]: 'No vencimento',
};

function calcProjectedReturn(investment: InvestmentDto): { gross: number; days: number } {
  const start = new Date(investment.startDate);
  const today = new Date();
  const days = Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const principal = Number(investment.principal);
  const annualRate = Number(investment.rate) / 100;
  const gross = principal * Math.pow(1 + annualRate, days / 365);
  return { gross, days };
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPct(value: number) {
  return `${Number(value).toFixed(2)}% a.a.`;
}

export function InvestmentsPage() {
  const { activeAccount } = useAccounts();
  const accountId = activeAccount?.id ?? null;
  const { investments, isLoading, create, remove } = useInvestments(accountId);

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>(InvestmentType.CDB);
  const [liquidity, setLiquidity] = useState<InvestmentLiquidity>(InvestmentLiquidity.D2);
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [maturityDate, setMaturityDate] = useState('');

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !principal || !rate) return;
    await create({
      name,
      type,
      liquidity,
      principal,
      rate,
      startDate: new Date(startDate).toISOString(),
      maturityDate: maturityDate ? new Date(maturityDate).toISOString() : undefined,
    });
    setName('');
    setPrincipal('');
    setRate('');
    setMaturityDate('');
    setIsCreating(false);
  }

  const totalInvested = investments.reduce((s, i) => s + Number(i.principal), 0);
  const totalProjected = investments.reduce((s, i) => s + calcProjectedReturn(i).gross, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Investimentos</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      <div className="investments-summary">
        <div className="summary-card">
          <span className="summary-label">Total investido</span>
          <span className="summary-value">{formatBRL(totalInvested)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Rendimento atual</span>
          <span className="summary-value positive">{formatBRL(totalProjected - totalInvested)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Saldo total</span>
          <span className="summary-value">{formatBRL(totalProjected)}</span>
        </div>
      </div>

      <div className="card">
        {isCreating ? (
          <form onSubmit={handleSubmit} className="inline-form investment-form">
            <input
              placeholder="Nome (ex: CDB Nubank)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select value={type} onChange={(e) => setType(e.target.value as InvestmentType)}>
              {Object.values(InvestmentType).map((t) => (
                <option key={t} value={t}>{INVESTMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <select value={liquidity} onChange={(e) => setLiquidity(e.target.value as InvestmentLiquidity)}>
              {Object.values(InvestmentLiquidity).map((l) => (
                <option key={l} value={l}>{LIQUIDITY_LABELS[l]}</option>
              ))}
            </select>
            <input
              placeholder="Valor investido"
              type="number"
              step="0.01"
              min="0"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
            <input
              placeholder="Taxa anual (%)"
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <label className="input-label">
              Data de início
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="input-label">
              Vencimento (opcional)
              <input type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} />
            </label>
            <button type="submit">Adicionar</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setIsCreating(false)}>
              Cancelar
            </button>
          </form>
        ) : (
          <button type="button" className="btn-primary" onClick={() => setIsCreating(true)}>
            + Novo investimento
          </button>
        )}
      </div>

      <div className="card">
        {isLoading ? (
          <p className="muted">Carregando...</p>
        ) : investments.length === 0 ? (
          <p className="muted">Nenhum investimento cadastrado.</p>
        ) : (
          <ul className="investment-list">
            {investments.map((inv) => {
              const { gross, days } = calcProjectedReturn(inv);
              const gain = gross - Number(inv.principal);
              const gainPct = (gain / Number(inv.principal)) * 100;
              return (
                <li key={inv.id} className="investment-item">
                  <div className="investment-info">
                    <div className="investment-header">
                      <span className="investment-name">{inv.name}</span>
                      <span className="investment-badge">{INVESTMENT_TYPE_LABELS[inv.type]}</span>
                      <span className="investment-badge">{LIQUIDITY_LABELS[inv.liquidity]}</span>
                    </div>
                    <div className="investment-details">
                      <span>Aplicado: {formatBRL(Number(inv.principal))}</span>
                      <span>Taxa: {formatPct(Number(inv.rate))}</span>
                      <span>Há {days} dias</span>
                      {inv.maturityDate && (
                        <span>
                          Vence em:{' '}
                          {new Date(inv.maturityDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="investment-return">
                    <span className="investment-gross">{formatBRL(gross)}</span>
                    <span className="positive">+{formatBRL(gain)} ({gainPct.toFixed(2)}%)</span>
                  </div>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => remove(inv.id)}
                    aria-label="Remover"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
