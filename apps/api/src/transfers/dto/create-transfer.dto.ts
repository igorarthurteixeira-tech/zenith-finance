import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransferDto {
  @IsUUID()
  fromAccountId: string;

  @IsUUID()
  toAccountId: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  description?: string;
}
