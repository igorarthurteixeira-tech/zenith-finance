import type { InvestmentDto, CreateInvestmentInput, UpdateInvestmentInput } from '@zenith/shared';
import { apiClient } from './client';

export const investmentsApi = {
  list: (accountId: string) =>
    apiClient.get<InvestmentDto[]>(`/accounts/${accountId}/investments`),
  create: (accountId: string, input: CreateInvestmentInput) =>
    apiClient.post<InvestmentDto>(`/accounts/${accountId}/investments`, input),
  update: (accountId: string, investmentId: string, input: UpdateInvestmentInput) =>
    apiClient.patch<InvestmentDto>(`/accounts/${accountId}/investments/${investmentId}`, input),
  remove: (accountId: string, investmentId: string) =>
    apiClient.delete<void>(`/accounts/${accountId}/investments/${investmentId}`),
};
