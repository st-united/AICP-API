import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AspectStatisticsResponseDto {
  @Expose()
  @ApiProperty({ example: 100 })
  total: number;

  @Expose()
  @ApiProperty({ example: 50 })
  referenced: number;

  @Expose()
  @ApiProperty({ example: 30 })
  available: number;

  @Expose()
  @ApiProperty({ example: 20 })
  draft: number;
}
