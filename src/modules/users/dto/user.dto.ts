import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDto {
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
  dob: Date;

  @Expose()
  @ApiProperty()
  country: string;

  @Expose()
  @ApiProperty()
  province: string;

  @Expose()
  @ApiProperty()
  job: string;

  @Expose()
  @ApiProperty()
  referralCode: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  deletedAt?: Date;
}
