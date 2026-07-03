import type { CategoryDto, CreateCategoryInput } from '@zenith/shared';
import { apiClient } from './client';

export const categoriesApi = {
  list: (accountId: string) =>
    apiClient.get<CategoryDto[]>(`/accounts/${accountId}/categories`),
  create: (accountId: string, input: CreateCategoryInput) =>
    apiClient.post<CategoryDto>(`/accounts/${accountId}/categories`, input),
  remove: (accountId: string, categoryId: string) =>
    apiClient.delete<void>(`/accounts/${accountId}/categories/${categoryId}`),
  seedDefaults: (accountId: string) =>
    apiClient.post<CategoryDto[]>(
      `/accounts/${accountId}/categories/seed-defaults`,
    ),
};
