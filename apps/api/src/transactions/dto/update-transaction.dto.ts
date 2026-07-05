import {
  IsBoolean,
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

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  walletId?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'invoicePeriod deve estar no formato YYYY-MM',
  })
  invoicePeriod?: string;

  @IsOptional()
  @IsBoolean()
  countsInTotal?: boolean;
}
