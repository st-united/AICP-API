import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @ApiProperty({ description: 'email', example: 'example@example.com' })
  @Expose()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'phoneNumber', example: '0123456789' })
  @Expose()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Date of birth in ISO format', example: '2021-01-01T00:00:00.000Z' })
  @Expose()
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date string' })
  dob?: string;

  @ApiProperty({ description: 'country', example: 'Vietnam' })
  @Expose()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'province', example: 'Hanoi' })
  @Expose()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({
    description: 'List of Domain IDs the user belongs to',
    example: ['uuid-domain-1', 'uuid-domain-2'],
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  job?: string[];

  @ApiProperty({ description: 'referralCode', example: 'REF123' })
  @Expose()
  @IsOptional()
  @IsString()
  referralCode?: string;
}
