import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssessmentMethodDto {
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1', description: 'ID của phương pháp đánh giá' })
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'assessment method 123',
    description: 'Tên của phương pháp đánh giá',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 50,
    description: 'Trọng số của phương pháp đánh giá trong tiêu chí',
  })
  weightWithinDimension: number;
}
