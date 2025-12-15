import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterBookingResponseItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  timeSlots?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  nameExamSet?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
