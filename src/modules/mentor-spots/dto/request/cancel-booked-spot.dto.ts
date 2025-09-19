import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CancelBookedSpotDto {
  @ApiProperty({ description: 'Exam liên quan đến booking (trùng với InterviewRequest.examId)' })
  @IsString()
  examId!: string;

  @ApiProperty({ required: false, description: '(Optional) ID người hủy để audit/authorize' })
  @IsOptional()
  @IsString()
  userId?: string;
}
