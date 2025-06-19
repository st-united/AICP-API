import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @Expose()
  @Transform(({ value }) => (value === null || value === '' ? undefined : value), { toPlainOnly: true })
  @ApiPropertyOptional({ description: 'Access token' })
  status?: boolean;
}
