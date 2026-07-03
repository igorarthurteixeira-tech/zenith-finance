import { IsEnum, IsString, MinLength } from 'class-validator';
import { AccountType } from '@zenith/shared';

export class CreateAccountDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(AccountType)
  type: AccountType;
}
