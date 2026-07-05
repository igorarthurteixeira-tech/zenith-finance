import type {
  CreateInstallmentPurchaseInput,
  CreateTransactionInput,
  TransactionDto,
  UpdateTransactionInput,
  UpdateInstallmentGroupInput,
} from '@zenith/shared';
import { apiClient } from './client';

export const transactionsApi = {
  list: (accountId: string) =>
    apiClient.get<TransactionDto[]>(`/accounts/${accountId}/transactions`),
  create: (accountId: string, input: CreateTransactionInput) =>
    apiClient.post<TransactionDto>(`/accounts/${accountId}/transactions`, input),
  createInstallmentPurchase: (accountId: string, input: CreateInstallmentPurchaseInput) =>
    apiClient.post<TransactionDto[]>(
      `/accounts/${accountId}/transactions/installments`,
      input,
    ),
  update: (accountId: string, transactionId: string, input: UpdateTransactionInput) =>
    apiClient.patch<TransactionDto>(
      `/accounts/${accountId}/transactions/${transactionId}`,
      input,
    ),
  remove: (accountId: string, transactionId: string) =>
    apiClient.delete<void>(`/accounts/${accountId}/transactions/${transactionId}`),
  updateInstallmentGroup: (accountId: string, installmentGroupId: string, input: UpdateInstallmentGroupInput) =>
    apiClient.patch<void>(
      `/accounts/${accountId}/transactions/group/${installmentGroupId}`,
      input,
    ),
  removeInstallmentGroup: (accountId: string, installmentGroupId: string, scope?: string, referenceDate?: string) => {
    const params = new URLSearchParams();
    if (scope) params.set('scope', scope);
    if (referenceDate) params.set('referenceDate', referenceDate);
    const qs = params.toString();
    return apiClient.delete<void>(
      `/accounts/${accountId}/transactions/group/${installmentGroupId}${qs ? `?${qs}` : ''}`,
    );
  },
};
