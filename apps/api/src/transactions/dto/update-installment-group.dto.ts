import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
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
  @IsEnum(['all', 'before', 'up_to'])
  scope?: InstallmentGroupScope;

  @IsOptional()
  @IsDateString()
  referenceDate?: string;
}
