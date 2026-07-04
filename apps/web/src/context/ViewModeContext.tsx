import { createContext, useContext, useState, type ReactNode } from 'react';

export type ViewMode = 'monthly' | 'quarterly' | 'semester' | 'annual';

export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
}

export function getPeriodRange(mode: ViewMode, now = new Date()): PeriodRange {
  const y = now.getFullYear();
  const m = now.getMonth();

  if (mode === 'monthly') {
    return {
      start: new Date(y, m, 1),
      end: new Date(y, m + 1, 0, 23, 59, 59, 999),
      label: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  }

  if (mode === 'quarterly') {
    const q = Math.floor(m / 3);
    return {
      start: new Date(y, q * 3, 1),
      end: new Date(y, q * 3 + 3, 0, 23, 59, 59, 999),
      label: `${q + 1}º Trimestre de ${y}`,
    };
  }

  if (mode === 'semester') {
    const s = Math.floor(m / 6);
    return {
      start: new Date(y, s * 6, 1),
      end: new Date(y, s * 6 + 6, 0, 23, 59, 59, 999),
      label: `${s + 1}º Semestre de ${y}`,
    };
  }

  return {
    start: new Date(y, 0, 1),
    end: new Date(y, 11, 31, 23, 59, 59, 999),
    label: `Ano ${y}`,
  };
}

export const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semester', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
];

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider');
  return ctx;
}
