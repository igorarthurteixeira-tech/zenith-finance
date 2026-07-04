import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateInvestmentInput, UpdateInvestmentInput } from '@zenith/shared';
import { investmentsApi } from '../api/investments';

export function useInvestments(accountId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['investments', accountId];

  const query = useQuery({
    queryKey,
    queryFn: () => investmentsApi.list(accountId!),
    enabled: !!accountId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateInvestmentInput) => investmentsApi.create(accountId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ investmentId, input }: { investmentId: string; input: UpdateInvestmentInput }) =>
      investmentsApi.update(accountId!, investmentId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: (investmentId: string) => investmentsApi.remove(accountId!, investmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    investments: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}
