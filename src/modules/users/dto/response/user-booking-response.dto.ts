import { ApiProperty } from '@nestjs/swagger';
import { MentorBookingStatus, TimeSlotBooking } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UserBookingResponseDto {
  @ApiProperty({
    description: 'Booking ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Mentor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  mentorId: string;

  @ApiProperty({
    description: 'Scheduled date and time',
    example: '2024-01-15T10:00:00Z',
  })
  @Expose()
  scheduledAt: Date;

  @ApiProperty({
    description: 'Time slot for the booking',
    enum: TimeSlotBooking,
    example: 'AM_09_10',
  })
  @Expose()
  timeSlot: TimeSlotBooking;

  @ApiProperty({
    description: 'Booking status',
    enum: MentorBookingStatus,
    example: 'PENDING',
  })
  @Expose()
  status: MentorBookingStatus;

  @ApiProperty({
    description: 'Notes for the booking',
    example: 'I would like to discuss AI fundamentals',
  })
  @Expose()
  notes?: string;

  @ApiProperty({
    description: 'Pillar focus for the booking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  pillarFocus?: string;

  @ApiProperty({
    description: 'Created date',
    example: '2024-01-15T10:00:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date',
    example: '2024-01-15T10:00:00Z',
  })
  @Expose()
  updatedAt: Date;
}
