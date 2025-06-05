// src/mentors/dto/get-available-mentors.dto.ts
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TimeSlotBooking } from '@prisma/client';

export class GetAvailableMentorsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string; // yyyy-MM-dd (ISO format)

  @IsOptional()
  @IsEnum(TimeSlotBooking)
  timeSlot?: TimeSlotBooking;

  @IsString()
  take: string;

  @IsString()
  skip: string;
}
