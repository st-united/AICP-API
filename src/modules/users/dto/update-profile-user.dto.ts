import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileUserDto {
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

  @ApiProperty({ description: 'phoneNumber', example: '0123456789' })
  @Expose()
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
