import { IsArray, ArrayNotEmpty, IsString, IsUUID, IsDateString } from 'class-validator';

export class SelectBookingDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds: string[];

  @IsString()
  @IsUUID()
  examId: string;

  @IsDateString()
  scheduledAt: string;
}
