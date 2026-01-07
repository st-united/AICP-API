import { IsISO8601, IsString } from 'class-validator';

export class CreateMentorBookingDto {
  @IsString()
  examId: string;

  @IsISO8601()
  startAt: string;

  @IsISO8601()
  endAt: string;
}
