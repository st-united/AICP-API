import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { UserRoleEnum } from '@Constant/index';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @Expose()
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsNotEmpty()
  password: string;

  @Expose()
  @IsNotEmpty()
  fullName: string;

  @Expose()
  @IsNotEmpty()
  phoneNumber: string;

  @Expose()
  @IsOptional()
  avatarUrl?: string;

  @Expose()
  @IsOptional()
  provider?: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  status?: boolean = false;

  @IsEnum(UserRoleEnum)
  @Transform(({ value }) => value ?? UserRoleEnum.USER)
  role: string = UserRoleEnum.USER;

  @Expose()
  @IsOptional()
  @IsDate()
  dob?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
