import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsString, IsNumber, IsBoolean, IsNotEmpty, Length, Min, Max } from 'class-validator';

export class LevelDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Level',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'ID không được rỗng' })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Level 1',
    description: 'Tên của Level',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được rỗng' })
  @Length(1, 100, { message: 'Tên phải có độ dài từ 1 đến 100 ký tự' })
  name: string;

  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Số thứ tự của Level',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Số thứ tự phải là số nguyên' })
  @IsNotEmpty({ message: 'Số thứ tự không được rỗng' })
  @Min(1, { message: 'Số thứ tự phải lớn hơn 0' })
  @Max(100, { message: 'Số thứ tự phải nhỏ hơn hoặc bằng 100' })
  order: number;
}
