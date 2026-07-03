import type { CreateTransferInput, TransferDto } from '@zenith/shared';
import { apiClient } from './client';

export const transfersApi = {
  list: (accountId: string) =>
    apiClient.get<TransferDto[]>(`/transfers?accountId=${accountId}`),
  create: (input: CreateTransferInput) =>
    apiClient.post<TransferDto>('/transfers', input),
};
