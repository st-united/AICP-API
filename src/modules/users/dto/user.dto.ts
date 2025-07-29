import { ApiProperty } from '@nestjs/swagger';
import { Domain } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UserDto {
  @Expose()
  @ApiProperty()
  id?: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  phoneNumber: string;

  @Expose()
  @ApiProperty()
  fullName: string;

  @Expose()
  @ApiProperty()
  avatarUrl?: string;

  @Expose()
  @ApiProperty()
  provider?: string;

  @Expose()
  @ApiProperty()
  status: boolean;

  @Expose()
  @ApiProperty()
  dob?: Date;

  @Expose()
  @ApiProperty()
  country?: string;

  @Expose()
  @ApiProperty()
  province?: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  job?: Domain[];

  @Expose()
  @ApiProperty()
  referralCode?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  deletedAt?: Date;

  @Expose()
  @ApiProperty()
  refreshToken?: string;

  @Expose()
  @ApiProperty()
  position?: string;

  @Expose()
  @ApiProperty()
  timezone?: string;

  @Expose()
  @ApiProperty()
  languagePreference?: string;

  @Expose()
  @ApiProperty()
  isStudent?: boolean;

  @Expose()
  @ApiProperty()
  university?: string;

  @Expose()
  @ApiProperty()
  studentCode?: string;
}
