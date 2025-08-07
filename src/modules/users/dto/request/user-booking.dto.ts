import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { TimeSlotBooking } from '@prisma/client';

export class UserBookingDto {
  @ApiProperty({
    description: 'Mentor ID (optional, will use default mentor if not provided)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  mentorId?: string;

  @ApiProperty({
    description: 'Scheduled date and time for the booking',
    required: false,
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: 'Time slot for the booking',
    required: false,
    enum: TimeSlotBooking,
    example: 'AM_09_10',
  })
  @IsOptional()
  @IsEnum(TimeSlotBooking)
  timeSlot?: TimeSlotBooking;

  @ApiProperty({
    description: 'Notes for the booking',
    required: false,
    example: 'I would like to discuss AI fundamentals',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Pillar focus for the booking',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  pillarFocus?: string;
}
