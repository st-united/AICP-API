import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class GetMentorCalendarQueryDto {
  @ApiPropertyOptional({
    description: 'Start date (ISO string)',
    example: '2025-08-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO string)',
    example: '2025-08-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
