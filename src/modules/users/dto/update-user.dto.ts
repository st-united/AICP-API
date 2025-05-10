import { Expose } from 'class-transformer';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @Expose()
  @IsOptional()
  @IsString()
  username?: string;

  @Expose()
  @IsOptional()
  @IsString()
  email?: string;

  @Expose()
  @IsOptional()
  @IsString()
  fullName?: string;

  @Expose()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Expose()
  @IsOptional()
  @IsString()
  provider?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
