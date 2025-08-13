import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CheckUserBookingResponseDto {
  @ApiProperty({
    description: 'Whether the user has a booking or not',
    example: true,
  })
  @Expose()
  hasBooking: boolean;

  @ApiProperty({
    description: 'Booking details if exists',
    required: false,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      status: 'PENDING',
      scheduledAt: '2024-01-15T10:00:00Z',
    },
  })
  @Expose()
  booking?: {
    id: string;
    status: string;
    scheduledAt: Date;
  };
}
