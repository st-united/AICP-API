import { IsDateString } from 'class-validator';

export class GenerateMentorSlotsDto {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;
}
