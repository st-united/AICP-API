import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

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
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      interviewDate: '2024-01-15T10:00:00Z',
      timeSlot: 'AM_09_10',
      examId: '123e4567-e89b-12d3-a456-426614174001',
    },
    required: false,
  })
  interviewRequest?: {
    id: string;
    interviewDate: Date;
    timeSlot: string;
    examId: string;
  };
}
