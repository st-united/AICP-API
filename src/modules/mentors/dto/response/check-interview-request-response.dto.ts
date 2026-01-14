import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class InterviewRequestDetailDto {
  @Expose()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  examId: string;

  @Expose()
  @ApiProperty({
    description: 'Interview start time (ISO 8601)',
    example: '2025-08-07T08:00:00+07:00',
    required: false,
  })
  @Type(() => Date)
  startAt?: Date;

  @Expose()
  @ApiProperty({
    description: 'Interview end time (ISO 8601)',
    example: '2025-08-07T09:00:00+07:00',
    required: false,
  })
  @Type(() => Date)
  endAt?: Date;

  @Expose()
  @ApiProperty({
    description: 'Interview request status',
    example: 'ASSIGNED',
  })
  status: string;

  @Expose()
  @ApiProperty({
    description: 'Mentor id assigned to the interview',
    example: '123e4567-e89b-12d3-a456-426614174123',
    required: false,
  })
  mentorId?: string;

  @Expose()
  @ApiProperty({
    description: 'Mentor name assigned to the interview',
    example: 'Nguyen Van A',
    required: false,
  })
  mentorName?: string;

  @Expose()
  @ApiProperty({
    description: 'Meeting URL for the interview',
    example: 'https://meet.google.com/abc-defg-hij',
    required: false,
  })
  meetUrl?: string;
}

export class CheckInterviewRequestResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Whether the user has an interview request',
    example: true,
  })
  hasInterviewRequest: boolean;

  @Expose()
  @ApiProperty({
    description: 'Interview request details if exists',
    type: InterviewRequestDetailDto,
    required: false,
  })
  interviewRequest?: InterviewRequestDetailDto;
}
