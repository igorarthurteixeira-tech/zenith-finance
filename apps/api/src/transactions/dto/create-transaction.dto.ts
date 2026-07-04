import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsOptional()
  @IsUUID()
  walletId?: string;
}
