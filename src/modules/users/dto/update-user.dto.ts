import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'email', example: 'example@gmail.com' })
  @Expose()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'fullName', example: 'Nguyen Van A' })
  @Expose()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'avatarUrl', example: 'https://example.com/avatar.png' })
  @Expose()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // @ApiProperty({ description: 'provider', example: 'email' })
  @Expose()
  @IsOptional()
  @IsString()
  provider?: string;

  // @ApiProperty({ description: 'status', example: true })
  @Expose()
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
