import type {
  CreateInstallmentPurchaseInput,
  CreateTransactionInput,
  TransactionDto,
  UpdateTransactionInput,
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
  removeInstallmentGroup: (accountId: string, installmentGroupId: string) =>
    apiClient.delete<void>(
      `/accounts/${accountId}/transactions/installments/group/${installmentGroupId}`,
    ),
};
