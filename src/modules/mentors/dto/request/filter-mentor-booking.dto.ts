import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MentorBookingStatus, ExamLevelEnum } from '@prisma/client';
import { Transform } from 'class-transformer';
import { PageOptionsDto } from '@app/common/dtos';

export class FilterMentorBookingDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(ExamLevelEnum, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  levels?: ExamLevelEnum[];

  @IsOptional()
  @IsArray()
  @IsEnum(MentorBookingStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  statuses?: MentorBookingStatus[];

  @IsOptional()
  @Type(() => Date)
  dateStart?: Date;

  @IsOptional()
  @Type(() => Date)
  dateEnd?: Date;
}
