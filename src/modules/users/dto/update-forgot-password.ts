import { Expose } from 'class-transformer';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class UpdateForgotPasswordUserDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Expose()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
