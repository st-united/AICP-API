import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class CompetencyFrameworkListItemDto {
  @Expose()
  @ApiProperty({ example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1' })
  @IsUUID()
  id: string;

  @Expose()
  @ApiProperty({ example: 'Effective Communication' })
  name: string;

  @Expose()
  @ApiProperty({ example: 10 })
  weightWithinDimension: number;
}
