import { IsOptional, IsString, Matches, IsUUID } from 'class-validator';

export class GetAvailableSlotsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;

  @IsOptional()
  @IsUUID()
  mentorId?: string;
}
