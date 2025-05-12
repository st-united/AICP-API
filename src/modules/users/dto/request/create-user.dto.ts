import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsBoolean, IsDate } from 'class-validator';

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
