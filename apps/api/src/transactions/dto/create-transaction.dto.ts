import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { TransactionType } from '@zenith/shared';

export class CreateTransactionDto {
  @IsString()
  @MinLength(1)
  description: string;

  @IsNumberString()
  amount: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsUUID()
  walletId: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'invoicePeriod deve estar no formato YYYY-MM',
  })
  invoicePeriod?: string;
}
