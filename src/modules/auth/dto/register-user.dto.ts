import { PASSWORD_REGEX_PATTERN, PHONE_REGEX_PATTERN } from '@Constant/index';
import { IsString, IsEmail, IsNotEmpty, Matches, IsBoolean } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PHONE_REGEX_PATTERN, { message: 'Số điện thoại không hợp lệ' })
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX_PATTERN, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
  })
  password: string;
}
