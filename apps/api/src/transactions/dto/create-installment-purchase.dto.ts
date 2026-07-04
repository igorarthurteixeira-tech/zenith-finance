import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { InstallmentAmountMode, TransactionType } from '@zenith/shared';

export class CreateInstallmentPurchaseDto {
  @IsString()
  @MinLength(1)
  description: string;

  @IsUUID()
  walletId: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDateString()
  date: string;

  @IsEnum(InstallmentAmountMode)
  amountMode: InstallmentAmountMode;

  @IsNumberString()
  amount: string;

  @IsInt()
  @Min(1)
  @Max(120)
  totalInstallments: number;

  @IsInt()
  @Min(1)
  startInstallment: number;

  @Matches(/^\d{4}-\d{2}$/, {
    message: 'startInvoicePeriod deve estar no formato YYYY-MM',
  })
  startInvoicePeriod: string;

  @IsBoolean()
  includePastInstallments: boolean;
}
