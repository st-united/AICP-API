import { PASSWORD_REGEX_PATTERN } from '@Constant/index';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
export class CredentialsDto {
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(PASSWORD_REGEX_PATTERN, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
  })
  password: string;
}
