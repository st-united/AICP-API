// src/mentor-booking/dto/create-mentor-booking.dto.ts
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TimeSlotBooking } from '@prisma/client';

export class CreateMentorBookingDto {
  @IsString()
  userId: string;

  @IsString()
  examId: string;

  @IsDateString()
  scheduledAt: string; // ISO Date string: '2025-06-10'

  @IsEnum(TimeSlotBooking)
  timeSlot: TimeSlotBooking;

  @IsOptional()
  @IsString()
  notes?: string;
}
