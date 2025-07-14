import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountDto {
  @Expose()
  @ApiProperty({ description: 'Activation token' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
