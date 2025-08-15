import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MentorBookingStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class FilterMentorBookingDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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
  levels?: string[];

  @IsOptional()
  @IsEnum(MentorBookingStatus)
  status?: MentorBookingStatus;

  @IsOptional()
  @Type(() => Date)
  dateStart?: Date;

  @IsOptional()
  @Type(() => Date)
  dateEnd?: Date;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
