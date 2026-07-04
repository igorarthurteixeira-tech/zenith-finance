import type { WalletDto, CreateWalletInput, UpdateWalletInput } from '@zenith/shared';
import { apiClient } from './client';

export const walletsApi = {
  list: (accountId: string) =>
    apiClient.get<WalletDto[]>(`/accounts/${accountId}/wallets`),
  create: (accountId: string, input: CreateWalletInput) =>
    apiClient.post<WalletDto>(`/accounts/${accountId}/wallets`, input),
  update: (accountId: string, walletId: string, input: UpdateWalletInput) =>
    apiClient.patch<WalletDto>(`/accounts/${accountId}/wallets/${walletId}`, input),
  remove: (accountId: string, walletId: string) =>
    apiClient.delete<void>(`/accounts/${accountId}/wallets/${walletId}`),
};
