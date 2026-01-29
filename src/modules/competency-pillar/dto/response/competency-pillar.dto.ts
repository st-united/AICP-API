import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CompetencyDimension } from '@prisma/client';
import { IsString, IsUUID, IsEnum, IsNotEmpty, Length } from 'class-validator';

export class CompetencyPillarDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Competency Pillar',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'ID không được rỗng' })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Mindset',
    description: 'Tên của Competency Pillar',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được rỗng' })
  @Length(1, 255, { message: 'Tên phải có độ dài từ 1 đến 255 ký tự' })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'MINDSET',
    description: 'Dimension của Competency Pillar',
    enum: CompetencyDimension,
    enumName: 'CompetencyDimension',
  })
  @IsEnum(CompetencyDimension, { message: 'Dimension phải là một giá trị hợp lệ' })
  @IsNotEmpty({ message: 'Dimension không được rỗng' })
  dimension: CompetencyDimension;
}
