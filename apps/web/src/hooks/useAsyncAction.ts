import { useState, useCallback } from 'react';

export function useAsyncAction() {
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(async (fn: () => Promise<unknown>) => {
    if (isPending) return;
    setIsPending(true);
    try {
      await fn();
    } finally {
      setIsPending(false);
    }
  }, [isPending]);

  return { isPending, run };
}

export function useAsyncSet() {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const run = useCallback(async (id: string, fn: () => Promise<unknown>) => {
    if (pendingIds.has(id)) return;
    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await fn();
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [pendingIds]);

  return { pendingIds, run };
}
