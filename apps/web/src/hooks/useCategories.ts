import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCategoryInput } from '@zenith/shared';
import { categoriesApi } from '../api/categories';

export function useCategories(accountId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['categories', accountId];

  const query = useQuery({
    queryKey,
    queryFn: () => categoriesApi.list(accountId!),
    enabled: !!accountId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      categoriesApi.create(accountId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: (categoryId: string) =>
      categoriesApi.remove(accountId!, categoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const seedDefaultsMutation = useMutation({
    mutationFn: () => categoriesApi.seedDefaults(accountId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    seedDefaults: seedDefaultsMutation.mutateAsync,
    isSeedingDefaults: seedDefaultsMutation.isPending,
  };
}
