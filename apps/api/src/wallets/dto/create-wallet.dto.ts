import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { WalletType } from '@zenith/shared';

export class CreateWalletDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;

  @IsOptional()
  @IsNumberString()
  initialBalance?: string;

  @IsOptional()
  @IsNumberString()
  creditLimit?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  closingDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  // Todo cartão de crédito precisa estar vinculado a uma conta existente.
  @ValidateIf((dto: CreateWalletDto) => dto.type === WalletType.CARTAO_CREDITO)
  @IsUUID()
  parentWalletId?: string;
}
