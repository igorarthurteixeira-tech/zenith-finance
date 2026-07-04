import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
}

export function getPeriodRange(month: Date): PeriodRange {
  const y = month.getFullYear();
  const m = month.getMonth();
  return {
    start: new Date(y, m, 1),
    end: new Date(y, m + 1, 0, 23, 59, 59, 999),
    label: month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  };
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(base: Date, delta: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

interface ViewModeContextValue {
  selectedMonth: Date;
  periodRange: PeriodRange;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => startOfMonth(new Date()));

  const goToPrevMonth = useCallback(() => setSelectedMonth((m) => shiftMonth(m, -1)), []);
  const goToNextMonth = useCallback(() => setSelectedMonth((m) => shiftMonth(m, +1)), []);

  const periodRange = getPeriodRange(selectedMonth);

  return (
    <ViewModeContext.Provider value={{ selectedMonth, periodRange, goToPrevMonth, goToNextMonth }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider');
  return ctx;
}
