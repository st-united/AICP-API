// src/mentors/dto/get-available-mentors.dto.ts
import { IsDateString, IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetAvailableMentorsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumberString()
  durationMinutes?: string;

  @IsString()
  take: string;

  @IsString()
  skip: string;
}
