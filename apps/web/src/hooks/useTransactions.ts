import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateInstallmentPurchaseInput,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@zenith/shared';
import { transactionsApi } from '../api/transactions';

export function useTransactions(accountId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['transactions', accountId];

  const query = useQuery({
    queryKey,
    queryFn: () => transactionsApi.list(accountId!),
    enabled: !!accountId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionsApi.create(accountId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ transactionId, input }: { transactionId: string; input: UpdateTransactionInput }) =>
      transactionsApi.update(accountId!, transactionId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: (transactionId: string) =>
      transactionsApi.remove(accountId!, transactionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const createInstallmentPurchaseMutation = useMutation({
    mutationFn: (input: CreateInstallmentPurchaseInput) =>
      transactionsApi.createInstallmentPurchase(accountId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    createInstallmentPurchase: createInstallmentPurchaseMutation.mutateAsync,
  };
}
