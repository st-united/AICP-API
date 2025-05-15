import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class TokenDto {
  @Expose()
  @ApiProperty({ description: 'Access token' })
  accessToken: string;
  @Expose()
  @ApiProperty({ description: 'Refresh token' })
  refreshToken?: string;
  @Expose()
  @ApiProperty({ description: 'Name' })
  name?: string;
}
