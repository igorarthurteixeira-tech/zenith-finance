import { useState, useEffect, type FormEvent } from 'react';
import {
  TransactionType,
  WalletType,
  InstallmentAmountMode,
  currentOpenInvoicePeriod,
  addMonthsToPeriod,
  invoicePeriodLabel,
  type CategoryDto,
  type WalletDto,
  type TransactionDto,
  type CreateInstallmentPurchaseInput,
} from '@zenith/shared';
import { Spinner } from '../ui/Spinner';
import { useAsyncAction } from '../../hooks/useAsyncAction';

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function upcomingPeriods(closingDay: number | null | undefined, count = 12): string[] {
  const open = currentOpenInvoicePeriod(closingDay);
  return Array.from({ length: count }, (_, i) => addMonthsToPeriod(open, i));
}

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
    invoicePeriod?: string;
  }) => Promise<unknown>;
  onSubmitInstallments?: (input: CreateInstallmentPurchaseInput) => Promise<unknown>;
  onCancel?: () => void;
  initialValues?: TransactionDto;
  defaultWalletId?: string;
}

export function TransactionForm({
  categories,
  wallets,
  onSubmit,
  onSubmitInstallments,
  onCancel,
  initialValues,
  defaultWalletId,
}: TransactionFormProps) {
  const isEditing = !!initialValues;
  const { isPending, run } = useAsyncAction();

  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [type, setType] = useState<TransactionType>(initialValues?.type ?? TransactionType.EXPENSE);
  const [date, setDate] = useState(() =>
    initialValues ? toDatetimeLocalValue(new Date(initialValues.date)) : toDatetimeLocalValue(new Date()),
  );
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [walletId, setWalletId] = useState(
    initialValues?.walletId ?? defaultWalletId ?? (wallets[0]?.id ?? ''),
  );

  const [invoicePeriod, setInvoicePeriod] = useState('');
  const [isInstallmentPurchase, setIsInstallmentPurchase] = useState(false);
  const [amountMode, setAmountMode] = useState<InstallmentAmountMode>(InstallmentAmountMode.TOTAL);
  const [totalInstallments, setTotalInstallments] = useState('2');
  const [startInstallment, setStartInstallment] = useState('1');
  const [includePastInstallments, setIncludePastInstallments] = useState(true);

  const selectedWallet = wallets.find((w) => w.id === walletId);
  const isCardWallet = selectedWallet?.type === WalletType.CARTAO_CREDITO;
  const periods = isCardWallet ? upcomingPeriods(selectedWallet.closingDay) : [];

  useEffect(() => {
    if (initialValues) {
      setDescription(initialValues.description);
      setAmount(initialValues.amount);
      setType(initialValues.type);
      setDate(toDatetimeLocalValue(new Date(initialValues.date)));
      setCategoryId(initialValues.categoryId ?? '');
      setWalletId(initialValues.walletId ?? wallets[0]?.id ?? '');
    }
  }, [initialValues, wallets]);

  useEffect(() => {
    if (!isEditing && defaultWalletId) {
      setWalletId(defaultWalletId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultWalletId]);

  useEffect(() => {
    if (isCardWallet && !initialValues) {
      setInvoicePeriod((current) => (periods.includes(current) ? current : periods[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId, isCardWallet]);

  const totalInstallmentsNum = Math.max(1, Number(totalInstallments) || 1);
  const startInstallmentNum = Math.min(
    Math.max(1, Number(startInstallment) || 1),
    totalInstallmentsNum,
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!description.trim() || !amount || !walletId) return;

    if (isCardWallet && isInstallmentPurchase && totalInstallmentsNum > 1 && onSubmitInstallments) {
      await run(async () => {
        await onSubmitInstallments({
          description,
          walletId,
          categoryId: categoryId || undefined,
          type,
          date: new Date(date).toISOString(),
          amountMode,
          amount,
          totalInstallments: totalInstallmentsNum,
          startInstallment: startInstallmentNum,
          startInvoicePeriod: invoicePeriod,
          includePastInstallments: startInstallmentNum > 1 ? includePastInstallments : true,
        });
        setDescription('');
        setAmount('');
        setIsInstallmentPurchase(false);
        setTotalInstallments('2');
        setStartInstallment('1');
      });
      return;
    }

    await run(async () => {
      await onSubmit({
        description,
        amount,
        type,
        date: new Date(date).toISOString(),
        categoryId: categoryId || undefined,
        walletId,
        invoicePeriod: isCardWallet ? invoicePeriod : undefined,
      });
      if (!isEditing) {
        setDescription('');
        setAmount('');
      }
    });
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isPending}
      />
      <input
        placeholder="Valor"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isPending}
      />
      <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} disabled={isPending}>
        <option value={TransactionType.EXPENSE}>Despesa</option>
        <option value={TransactionType.INCOME}>Receita</option>
      </select>
      <select
        value={walletId}
        onChange={(e) => setWalletId(e.target.value)}
        required
        disabled={isPending}
        style={!walletId ? { borderColor: 'var(--color-negative)' } : undefined}
      >
        {wallets.length === 0 && <option value="">Nenhuma conta cadastrada</option>}
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={isPending}>
        <option value="">Sem categoria</option>
        {filteredCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} disabled={isPending} />

      {isCardWallet && (
        <select value={invoicePeriod} onChange={(e) => setInvoicePeriod(e.target.value)} disabled={isPending}>
          {periods.map((period) => (
            <option key={period} value={period}>
              Fatura de {invoicePeriodLabel(period)}
            </option>
          ))}
        </select>
      )}

      {isCardWallet && !isEditing && onSubmitInstallments && (
        <label className="installment-toggle">
          <input
            type="checkbox"
            checked={isInstallmentPurchase}
            onChange={(e) => setIsInstallmentPurchase(e.target.checked)}
            disabled={isPending}
          />
          Compra parcelada
        </label>
      )}

      {isCardWallet && !isEditing && isInstallmentPurchase && onSubmitInstallments && (
        <div className="installment-panel">
          <label className="input-label">
            O valor digitado é
            <select
              value={amountMode}
              onChange={(e) => setAmountMode(e.target.value as InstallmentAmountMode)}
              disabled={isPending}
            >
              <option value={InstallmentAmountMode.TOTAL}>Total da compra</option>
              <option value={InstallmentAmountMode.PER_INSTALLMENT}>Valor de cada parcela</option>
            </select>
          </label>
          <label className="input-label">
            Quantidade de parcelas
            <input
              type="number"
              min={1}
              max={120}
              value={totalInstallments}
              onChange={(e) => setTotalInstallments(e.target.value)}
              disabled={isPending}
            />
          </label>
          <label className="input-label">
            Essa fatura é a parcela nº
            <input
              type="number"
              min={1}
              max={totalInstallmentsNum}
              value={startInstallment}
              onChange={(e) => setStartInstallment(e.target.value)}
              disabled={isPending}
            />
          </label>
          {startInstallmentNum > 1 && (
            <label className="installment-toggle">
              <input
                type="checkbox"
                checked={includePastInstallments}
                onChange={(e) => setIncludePastInstallments(e.target.checked)}
                disabled={isPending}
              />
              Lançar também as parcelas 1 a {startInstallmentNum - 1} no histórico (ainda não foram
              contabilizadas em outro lugar)
            </label>
          )}
        </div>
      )}

      <button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending
          ? <><Spinner /> {isEditing ? 'Salvando…' : 'Adicionando…'}</>
          : isEditing ? 'Salvar' : 'Adicionar'}
      </button>
      {onCancel && (
        <button type="button" className="btn-ghost btn-sm" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
      )}
    </form>
  );
}
