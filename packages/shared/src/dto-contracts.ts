import { AccountType, TransactionType, InvestmentType, InvestmentLiquidity, CdbModalidade } from './enums';

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

export interface WalletDto {
  id: string;
  name: string;
  accountId: string;
}

export interface CreateWalletInput {
  name: string;
}

export interface UpdateWalletInput {
  name?: string;
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
  walletId: string | null;
}

export interface CreateTransactionInput {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  categoryId?: string;
  walletId: string;
}

export interface UpdateTransactionInput {
  description?: string;
  amount?: string;
  type?: TransactionType;
  date?: string;
  categoryId?: string;
  walletId?: string;
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

export interface InvestmentDto {
  id: string;
  name: string;
  type: InvestmentType;
  liquidity: InvestmentLiquidity;
  principal: string;
  rate: string;
  cdbModalidade: CdbModalidade | null;
  cdiRate: string | null;
  cardWalletId: string | null;
  startDate: string;
  maturityDate: string | null;
  accountId: string;
}

export interface CreateInvestmentInput {
  name: string;
  type: InvestmentType;
  liquidity: InvestmentLiquidity;
  principal: string;
  rate: string;
  cdbModalidade?: CdbModalidade;
  cdiRate?: string;
  cardWalletId?: string;
  startDate: string;
  maturityDate?: string;
}

export interface UpdateInvestmentInput {
  name?: string;
  type?: InvestmentType;
  liquidity?: InvestmentLiquidity;
  principal?: string;
  rate?: string;
  cdbModalidade?: CdbModalidade;
  cdiRate?: string;
  cardWalletId?: string;
  startDate?: string;
  maturityDate?: string;
}
