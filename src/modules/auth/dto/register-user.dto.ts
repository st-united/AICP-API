import { PASSWORD_REGEX_PATTERN, PHONE_REGEX_PATTERN, UserRoleEnum } from '@Constant/index';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, Matches, IsBoolean } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: 'Fullname', example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Phone Number', example: '0901234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(PHONE_REGEX_PATTERN, { message: 'Số điện thoại không hợp lệ' })
  phoneNumber: string;

  @ApiProperty({ description: 'Valid Email', example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password must be at least 8 characters, including uppercase, lowercase and numbers',
    example: 'Password123',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX_PATTERN, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
  })
  password: string;

  @ApiProperty({ description: 'User role', example: UserRoleEnum.USER, default: UserRoleEnum.USER })
  @Expose()
  @Transform(({ value }) => value ?? UserRoleEnum.USER)
  role: string = UserRoleEnum.USER;
}
