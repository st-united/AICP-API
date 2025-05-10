// src/user/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  fullName: string;

  @Expose()
  @ApiProperty({ required: false })
  avatarUrl?: string;

  @Expose()
  @ApiProperty({ required: false })
  provider?: string;

  @Expose()
  @ApiProperty()
  status: boolean;
}
