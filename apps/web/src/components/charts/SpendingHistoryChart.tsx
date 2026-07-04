import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { TransactionType, type TransactionDto, type WalletDto } from '@zenith/shared';

interface SpendingHistoryChartProps {
  transactions: TransactionDto[];
  wallets: WalletDto[];
}

interface ChartPoint {
  dateKey: string;
  label: string;
  balance: number;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dateKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildPoints(transactions: TransactionDto[], wallets: WalletDto[]): ChartPoint[] {
  const startingBalance = wallets.reduce((sum, w) => sum + Number(w.initialBalance), 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const dayDeltas = new Map<string, number>();
  for (const t of transactions) {
    if (!t.countsInTotal) continue;
    if (new Date(t.date) > todayEnd) continue; // ignora parcelas futuras
    const key = dateKeyOf(new Date(t.date));
    const delta = t.type === TransactionType.INCOME ? Number(t.amount) : -Number(t.amount);
    dayDeltas.set(key, (dayDeltas.get(key) ?? 0) + delta);
  }

  const sortedKeys = Array.from(dayDeltas.keys()).sort();
  let running = startingBalance;
  return sortedKeys.map((key) => {
    running += dayDeltas.get(key)!;
    const [, m, d] = key.split('-');
    return { dateKey: key, label: `${d}/${m}`, balance: running };
  });
}

const WIDTH = 800;
const HEIGHT = 260;
const PADDING = { top: 20, right: 20, bottom: 32, left: 60 };
const INNER_WIDTH = WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

export function SpendingHistoryChart({ transactions, wallets }: SpendingHistoryChartProps) {
  const points = useMemo(() => buildPoints(transactions, wallets), [transactions, wallets]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  if (points.length < 2) {
    return (
      <div className="card chart-card">
        <h3 className="card-title">Histórico de saldo</h3>
        <p className="muted">
          Adicione transações em pelo menos dois dias diferentes para ver o histórico.
        </p>
      </div>
    );
  }

  const values = points.map((p) => p.balance);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);
  const valueRange = maxValue - minValue || 1;

  const xFor = (index: number) =>
    PADDING.left + (index / (points.length - 1)) * INNER_WIDTH;
  const yFor = (value: number) =>
    PADDING.top + INNER_HEIGHT - ((value - minValue) / valueRange) * INNER_HEIGHT;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.balance)}`)
    .join(' ');
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${PADDING.top + INNER_HEIGHT} L ${xFor(0)} ${PADDING.top + INNER_HEIGHT} Z`;

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => minValue + (valueRange * i) / tickCount);
  const xLabelStep = Math.max(1, Math.ceil(points.length / 6));

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const localX = (event.clientX - rect.left) * scaleX;
    const ratio = (localX - PADDING.left) / INNER_WIDTH;
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(Math.max(idx, 0), points.length - 1));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const last = points[points.length - 1];

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <h3 className="card-title">Histórico de saldo</h3>
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? 'Ver gráfico' : 'Ver como tabela'}
        </button>
      </div>

      {showTable ? (
        <div className="chart-table-wrap">
          <table className="chart-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.dateKey}>
                  <td>{p.label}</td>
                  <td>{formatCurrency(p.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="chart-svg-wrap">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="chart-svg"
            role="img"
            aria-label={`Histórico de saldo: de ${formatCurrency(points[0].balance)} em ${points[0].label} a ${formatCurrency(last.balance)} em ${last.label}`}
          >
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={WIDTH - PADDING.right}
                  y1={yFor(tick)}
                  y2={yFor(tick)}
                  className="chart-gridline"
                />
                <text
                  x={PADDING.left - 10}
                  y={yFor(tick)}
                  className="chart-axis-label"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {tick.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </text>
              </g>
            ))}

            {points.map((p, i) =>
              i % xLabelStep === 0 || i === points.length - 1 ? (
                <text
                  key={p.dateKey}
                  x={xFor(i)}
                  y={HEIGHT - 8}
                  className="chart-axis-label"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              ) : null,
            )}

            <path d={areaPath} className="chart-area" />
            <path d={linePath} className="chart-line" />
            <circle cx={xFor(points.length - 1)} cy={yFor(last.balance)} r={4} className="chart-dot" />

            {hovered && hoverIndex !== null && (
              <>
                <line
                  x1={xFor(hoverIndex)}
                  x2={xFor(hoverIndex)}
                  y1={PADDING.top}
                  y2={PADDING.top + INNER_HEIGHT}
                  className="chart-crosshair"
                />
                <circle cx={xFor(hoverIndex)} cy={yFor(hovered.balance)} r={5} className="chart-dot chart-dot-hover" />
              </>
            )}

            <rect
              x={PADDING.left}
              y={PADDING.top}
              width={INNER_WIDTH}
              height={INNER_HEIGHT}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </svg>

          {hovered && hoverIndex !== null && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(xFor(hoverIndex) / WIDTH) * 100}%`,
                top: `${(yFor(hovered.balance) / HEIGHT) * 100}%`,
              }}
            >
              <span className="chart-tooltip-value">{formatCurrency(hovered.balance)}</span>
              <span className="chart-tooltip-label">{hovered.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
