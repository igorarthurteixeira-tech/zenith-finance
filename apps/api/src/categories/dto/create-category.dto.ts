import { IsEnum, IsString, MinLength } from 'class-validator';
import { TransactionType } from '@zenith/shared';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;
}
