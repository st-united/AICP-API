import { InterviewShift } from '@Constant/enums';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMentorBookingDto {
  @IsString()
  examId: string;

  @IsOptional()
  @IsString()
  interviewDate?: string;

  @IsEnum(InterviewShift)
  interviewShift: InterviewShift;
}
