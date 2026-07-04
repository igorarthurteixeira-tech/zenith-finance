import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { InvestmentType, InvestmentLiquidity } from '@zenith/shared';

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

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  maturityDate?: string;
}
