const PERIOD_FORMAT = /^\d{4}-\d{2}$/;

export function isValidInvoicePeriod(period: string): boolean {
  return PERIOD_FORMAT.test(period);
}

export function periodOf(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function addMonthsToPeriod(period: string, months: number): string {
  const [yearStr, monthStr] = period.split('-');
  const totalMonths = Number(yearStr) * 12 + (Number(monthStr) - 1) + months;
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return periodOf(year, month);
}

export function periodOfDate(date: Date): string {
  return periodOf(date.getFullYear(), date.getMonth() + 1);
}

/**
 * Fatura ainda aberta (aceitando novos lançamentos) para um cartão, dado o
 * dia de fechamento. Se hoje já passou do dia de fechamento, a fatura do mês
 * atual já fechou e a aberta é a do mês seguinte.
 */
export function currentOpenInvoicePeriod(closingDay: number | null | undefined, referenceDate = new Date()): string {
  const thisMonthPeriod = periodOfDate(referenceDate);
  if (!closingDay) return thisMonthPeriod;
  return referenceDate.getDate() > closingDay
    ? addMonthsToPeriod(thisMonthPeriod, 1)
    : thisMonthPeriod;
}

const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function invoicePeriodLabel(period: string): string {
  const [yearStr, monthStr] = period.split('-');
  const monthIndex = Number(monthStr) - 1;
  return `${MONTH_LABELS[monthIndex] ?? monthStr} de ${yearStr}`;
}

/** Desloca uma data em N meses, mantendo o dia (ajustando se o mês destino for mais curto). */
export function shiftDateByMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);
  return result;
}
