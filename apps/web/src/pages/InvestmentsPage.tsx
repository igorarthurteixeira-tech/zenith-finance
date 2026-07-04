import { useState, type FormEvent } from 'react';
import {
  InvestmentType,
  InvestmentLiquidity,
  CdbModalidade,
  type InvestmentDto,
  type WalletDto,
} from '@zenith/shared';
import { useAccounts } from '../context/AccountContext';
import { useInvestments } from '../hooks/useInvestments';
import { useWallets } from '../hooks/useWallets';
import { Spinner } from '../components/ui/Spinner';
import { useAsyncAction, useAsyncSet } from '../hooks/useAsyncAction';

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

function calcReturn(inv: InvestmentDto): { gross: number; businessDays: number } {
  const start = new Date(inv.startDate);
  const today = new Date();
  const calendarDays = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86_400_000));
  const principal = Number(inv.principal);

  if (inv.type === InvestmentType.CDB && inv.cdbModalidade === CdbModalidade.LIMITE_GARANTIDO && inv.cdiRate) {
    // Cálculo correto CDB Limite Garantido (juros compostos sobre CDI diário)
    const cdiAnual = Number(inv.cdiRate) / 100;
    const cdiDiario = Math.pow(1 + cdiAnual, 1 / 252) - 1;
    const taxaDiariaCdb = cdiDiario * (Number(inv.rate) / 100);
    const businessDays = Math.round(calendarDays * (252 / 365));
    const gross = principal * Math.pow(1 + taxaDiariaCdb, businessDays);
    return { gross, businessDays };
  }

  // CDB Normal e outros: taxa anual direta
  const annualRate = Number(inv.rate) / 100;
  const gross = principal * Math.pow(1 + annualRate, calendarDays / 365);
  return { gross, businessDays: calendarDays };
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function WalletTag({ walletId, wallets }: { walletId: string | null; wallets: WalletDto[] }) {
  if (!walletId) return null;
  const wallet = wallets.find((w) => w.id === walletId);
  if (!wallet) return null;
  return <span className="investment-badge investment-badge-wallet">{wallet.name}</span>;
}

export function InvestmentsPage() {
  const { activeAccount } = useAccounts();
  const accountId = activeAccount?.id ?? null;
  const { investments, isLoading, create, remove } = useInvestments(accountId);
  const { wallets } = useWallets(accountId);

  const { isPending: isSubmitting, run: runCreate } = useAsyncAction();
  const { pendingIds: removingIds, run: runRemove } = useAsyncSet();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>(InvestmentType.CDB);
  const [cdbModalidade, setCdbModalidade] = useState<CdbModalidade>(CdbModalidade.NORMAL);
  const [liquidity, setLiquidity] = useState<InvestmentLiquidity>(InvestmentLiquidity.D2);
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [cdiRate, setCdiRate] = useState('10.65');
  const [cardWalletId, setCardWalletId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [maturityDate, setMaturityDate] = useState('');

  if (!activeAccount) return <p>Nenhuma conta selecionada.</p>;

  const isLimiteGarantido = type === InvestmentType.CDB && cdbModalidade === CdbModalidade.LIMITE_GARANTIDO;

  function handleTypeChange(newType: InvestmentType) {
    setType(newType);
    if (newType === InvestmentType.CDB) {
      setLiquidity(InvestmentLiquidity.D2);
    } else {
      setCdbModalidade(CdbModalidade.NORMAL);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !principal || !rate) return;
    await runCreate(async () => {
      await create({
        name,
        type,
        liquidity,
        principal,
        rate,
        cdbModalidade: type === InvestmentType.CDB ? cdbModalidade : undefined,
        cdiRate: isLimiteGarantido ? cdiRate : undefined,
        cardWalletId: isLimiteGarantido && cardWalletId ? cardWalletId : undefined,
        startDate: new Date(startDate).toISOString(),
        maturityDate: maturityDate ? new Date(maturityDate).toISOString() : undefined,
      });
      setName('');
      setPrincipal('');
      setRate('');
      setMaturityDate('');
      setCardWalletId('');
      setIsCreating(false);
    });
  }

  const totalInvested = investments.reduce((s, i) => s + Number(i.principal), 0);
  const totalGross = investments.reduce((s, i) => s + calcReturn(i).gross, 0);
  const totalGain = totalGross - totalInvested;
  const totalCreditLimit = investments
    .filter((i) => i.cdbModalidade === CdbModalidade.LIMITE_GARANTIDO)
    .reduce((s, i) => s + calcReturn(i).gross, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Investimentos</h2>
        <p className="page-subtitle">{activeAccount.name}</p>
      </div>

      <div className="investments-summary">
        <div className="summary-card">
          <span className="summary-label">Total aplicado</span>
          <span className="summary-value">{formatBRL(totalInvested)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Rendimento total</span>
          <span className="summary-value positive">+{formatBRL(totalGain)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Saldo total</span>
          <span className="summary-value">{formatBRL(totalGross)}</span>
        </div>
        {totalCreditLimit > 0 && (
          <div className="summary-card summary-card-credit">
            <span className="summary-label">Limite garantido (crédito)</span>
            <span className="summary-value">{formatBRL(totalCreditLimit)}</span>
          </div>
        )}
      </div>

      <div className="card">
        {isCreating ? (
          <form onSubmit={handleSubmit} className="inline-form investment-form">
            <input
              placeholder="Nome (ex: CDB Nubank, Tesouro Selic)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select value={type} onChange={(e) => handleTypeChange(e.target.value as InvestmentType)}>
              {Object.values(InvestmentType).map((t) => (
                <option key={t} value={t}>{INVESTMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>

            {type === InvestmentType.CDB && (
              <select value={cdbModalidade} onChange={(e) => setCdbModalidade(e.target.value as CdbModalidade)}>
                <option value={CdbModalidade.NORMAL}>CDB Normal</option>
                <option value={CdbModalidade.LIMITE_GARANTIDO}>CDB Limite Garantido (crédito)</option>
              </select>
            )}

            <select value={liquidity} onChange={(e) => setLiquidity(e.target.value as InvestmentLiquidity)}>
              {Object.values(InvestmentLiquidity).map((l) => (
                <option key={l} value={l}>{LIQUIDITY_LABELS[l]}</option>
              ))}
            </select>

            <input
              placeholder="Valor aplicado (R$)"
              type="number"
              step="0.01"
              min="0"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />

            {isLimiteGarantido ? (
              <>
                <input
                  placeholder="% do CDI (ex: 102)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <input
                  placeholder="CDI atual % a.a. (ex: 10.65)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cdiRate}
                  onChange={(e) => setCdiRate(e.target.value)}
                />
                {wallets.length > 0 && (
                  <select value={cardWalletId} onChange={(e) => setCardWalletId(e.target.value)}>
                    <option value="">Sem cartão vinculado</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <input
                placeholder="Taxa anual % (ex: 12.5)"
                type="number"
                step="0.01"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            )}

            <label className="input-label">
              Data de início
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>

            {!isLimiteGarantido && (
              <label className="input-label">
                Vencimento (opcional)
                <input type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} />
              </label>
            )}

            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? <><Spinner /> Adicionando…</> : 'Adicionar'}
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setIsCreating(false)} disabled={isSubmitting}>
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
              const { gross, businessDays } = calcReturn(inv);
              const gain = gross - Number(inv.principal);
              const gainPct = (gain / Number(inv.principal)) * 100;
              const isLG = inv.cdbModalidade === CdbModalidade.LIMITE_GARANTIDO;

              return (
                <li key={inv.id} className={`investment-item${isLG ? ' investment-item-limite' : ''}`}>
                  <div className="investment-info">
                    <div className="investment-header">
                      <span className="investment-name">{inv.name}</span>
                      <span className="investment-badge">{INVESTMENT_TYPE_LABELS[inv.type]}</span>
                      {isLG && (
                        <span className="investment-badge investment-badge-credit">Limite Garantido</span>
                      )}
                      <span className="investment-badge">{LIQUIDITY_LABELS[inv.liquidity]}</span>
                      <WalletTag walletId={inv.cardWalletId} wallets={wallets} />
                    </div>
                    <div className="investment-details">
                      <span>Aplicado: {formatBRL(Number(inv.principal))}</span>
                      {isLG ? (
                        <>
                          <span>{inv.rate}% do CDI · CDI: {inv.cdiRate}% a.a.</span>
                          <span>Há {businessDays} dias úteis</span>
                        </>
                      ) : (
                        <>
                          <span>Taxa: {inv.rate}% a.a.</span>
                          <span>Há {businessDays} dias</span>
                        </>
                      )}
                      {inv.maturityDate && (
                        <span>Vence: {new Date(inv.maturityDate).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>

                  <div className="investment-return">
                    <span className="investment-gross">{formatBRL(gross)}</span>
                    <span className="positive">+{formatBRL(gain)} ({gainPct.toFixed(2)}%)</span>
                    {isLG && (
                      <span className="investment-credit-label">
                        Limite no cartão: {formatBRL(gross)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => runRemove(inv.id, () => remove(inv.id))}
                    disabled={removingIds.has(inv.id)}
                    aria-busy={removingIds.has(inv.id)}
                    aria-label="Remover"
                  >
                    {removingIds.has(inv.id) ? <Spinner /> : '×'}
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
