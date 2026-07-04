import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import {
  InvestmentType,
  InvestmentLiquidity,
  CdbModalidade,
} from '@zenith/shared';

export class CreateInvestmentDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(InvestmentType)
  type: InvestmentType;

  @IsEnum(InvestmentLiquidity)
  liquidity: InvestmentLiquidity;

  @IsNumberString()
  principal: string;

  @IsNumberString()
  rate: string;

  @IsOptional()
  @IsEnum(CdbModalidade)
  cdbModalidade?: CdbModalidade;

  @IsOptional()
  @IsNumberString()
  cdiRate?: string;

  @IsOptional()
  @IsUUID()
  cardWalletId?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  maturityDate?: string;
}
