import { ApiProperty } from '@nestjs/swagger';
import { CourseTypes, SFIALevel } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { array } from 'joi';
import { IsNull, Not } from 'typeorm';

export class CreateCourseDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ enum: CourseTypes, required: true })
  @IsNotEmpty()
  @IsEnum(CourseTypes)
  courseType: CourseTypes;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  durationHours: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID()
  domain: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  applicableObjects: string;

  @ApiProperty({
    required: true,
    type: 'string',
    format: 'binary',
  })
  thumbnailImage: any;

  @ApiProperty({ required: true })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }

    return value;
  })
  competencyAspects: string[];

  @ApiProperty({ enum: SFIALevel, isArray: true, required: true })
  @IsNotEmpty()
  @IsEnum(SFIALevel, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }

    return value;
  })
  sfiaLevels: SFIALevel[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courseInformation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactInformation?: string;
}
