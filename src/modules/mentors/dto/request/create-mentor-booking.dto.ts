// src/mentor-booking/dto/create-mentor-booking.dto.ts
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TimeSlotBooking } from '@prisma/client';

export class CreateMentorBookingDto {
  @IsString()
  examId: string;

  @IsOptional()
  @IsString()
  interviewDate?: string;
}
