import { IsOptional } from 'class-validator';

import { PageOptionsDto } from '@app/common/dtos';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersByAdminDto extends PageOptionsDto {
  @Expose()
  @IsOptional()
  @ApiProperty({ required: false })
  @Transform(({ value }) => {
    if (value === '0' || value === 'false') return false;
    if (value === '1' || value === 'true') return true;
    return undefined;
  })
  status: boolean;

  @Expose({ name: 'province[]' })
  @ApiProperty({
    required: false,
    type: [String],
    description: 'Filter by multiple provinces (array format)',
    example: ['Quang binh', 'Quang tri'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value.filter((item) => item && item.trim() !== '');
    }
    if (typeof value === 'string') {
      return [value];
    }

    return undefined;
  })
  'province[]': string[];

  @Expose({ name: 'job[]' })
  @ApiProperty({
    required: false,
    type: [String],
    description: 'Filter by multiple jobs (array format)',
    example: ['developer', 'designer'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value.filter((item) => item && item.trim() !== '');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return undefined;
  })
  'job[]': string[];

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  startDate: Date;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  endDate: Date;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  createdAt: Date;
}
