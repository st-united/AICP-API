import { IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMentorBookingDto {
  @IsString()
  examId: string;

  @IsISO8601()
  startAt: string;

  @IsISO8601()
  endAt: string;

  @IsOptional()
  @IsUUID()
  mentorId?: string;
}
