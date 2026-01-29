import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsISO8601 } from 'class-validator';

export class UserBookingDto {
  @ApiProperty({
    description: 'Mentor ID (optional, hệ thống sẽ auto assign nếu không truyền)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  mentorId?: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu phỏng vấn (ISO 8601)',
    example: '2025-08-07T08:00:00+07:00',
  })
  @IsISO8601()
  startAt: string;

  @ApiProperty({
    description: 'Thời gian kết thúc phỏng vấn (ISO 8601)',
    example: '2025-08-07T09:00:00+07:00',
  })
  @IsISO8601()
  endAt: string;

  @ApiProperty({
    description: 'Ghi chú cho buổi phỏng vấn',
    required: false,
    example: 'I would like to discuss AI fundamentals',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Pillar focus cho buổi phỏng vấn',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  pillarFocus?: string;
}
