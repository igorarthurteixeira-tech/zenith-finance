import { IsBoolean, IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
// IsEnum kept for TransactionType (TS enum); IsIn used for string-literal scope
import { TransactionType, InstallmentGroupScope } from '@zenith/shared';

export class UpdateInstallmentGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  countsInTotal?: boolean;

  @IsOptional()
  @IsUUID()
  walletId?: string;

  @IsOptional()
  @IsIn(['all', 'before', 'up_to'])
  scope?: InstallmentGroupScope;

  @IsOptional()
  @IsDateString()
  referenceDate?: string;
}
