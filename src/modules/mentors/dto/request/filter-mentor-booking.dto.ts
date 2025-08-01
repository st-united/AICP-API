import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { MentorBookingStatus } from '@prisma/client';

export class FilterMentorBookingDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  level?: string;

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
