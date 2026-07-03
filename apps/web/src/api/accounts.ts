import type { AccountDto, CreateAccountInput } from '@zenith/shared';
import { apiClient } from './client';

export const accountsApi = {
  list: () => apiClient.get<AccountDto[]>('/accounts'),
  create: (input: CreateAccountInput) =>
    apiClient.post<AccountDto>('/accounts', input),
  remove: (accountId: string) =>
    apiClient.delete<void>(`/accounts/${accountId}`),
};
