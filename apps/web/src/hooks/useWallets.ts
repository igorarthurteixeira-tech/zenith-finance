import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateWalletInput, UpdateWalletInput } from '@zenith/shared';
import { walletsApi } from '../api/wallets';

export function useWallets(accountId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['wallets', accountId];

  const query = useQuery({
    queryKey,
    queryFn: () => walletsApi.list(accountId!),
    enabled: !!accountId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateWalletInput) => walletsApi.create(accountId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ walletId, input }: { walletId: string; input: UpdateWalletInput }) =>
      walletsApi.update(accountId!, walletId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: (walletId: string) => walletsApi.remove(accountId!, walletId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    wallets: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}
