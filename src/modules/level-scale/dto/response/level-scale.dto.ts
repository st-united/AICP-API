import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  Length,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { LevelDto } from './level.dto';

export class LevelScaleDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Level Scale',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'ID không được rỗng' })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Default Level Scale',
    description: 'Tên của Level Scale',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được rỗng' })
  @Length(1, 255, { message: 'Tên phải có độ dài từ 1 đến 255 ký tự' })
  name: string;

  @Expose()
  @Type(() => LevelDto)
  @ApiProperty({
    description: 'Danh sách các Level thuộc Level Scale',
    type: [LevelDto],
    isArray: true,
  })
  @IsArray({ message: 'Levels phải là một mảng' })
  @ValidateNested({ each: true, message: 'Mỗi level phải hợp lệ' })
  @Type(() => LevelDto)
  @IsNotEmpty({ message: 'Danh sách levels không được rỗng' })
  levels: LevelDto[];
}
