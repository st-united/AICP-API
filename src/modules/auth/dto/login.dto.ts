import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  password: string;
}
