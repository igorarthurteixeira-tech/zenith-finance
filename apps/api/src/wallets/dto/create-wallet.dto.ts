import { IsString, MinLength } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @MinLength(1)
  name: string;
}
