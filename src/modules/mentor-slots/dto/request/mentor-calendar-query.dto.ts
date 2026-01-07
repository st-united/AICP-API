import { IsDateString, IsOptional } from 'class-validator';

export class MentorCalendarQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
