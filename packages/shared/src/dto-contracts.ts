import { AccountType, TransactionType } from './enums';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
}

export interface AccountDto {
  id: string;
  name: string;
  type: AccountType;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
}

export interface CategoryDto {
  id: string;
  name: string;
  type: TransactionType;
  accountId: string;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
}

export interface TransactionDto {
  id: string;
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  accountId: string;
  categoryId: string | null;
}

export interface CreateTransactionInput {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  categoryId?: string;
}

export interface TransferDto {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string | null;
  createdAt: string;
}

export interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description?: string;
}
