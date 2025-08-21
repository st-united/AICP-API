import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ExportStudentsDto {
  @ApiProperty({
    description: 'Start date for account registration (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'End date for account registration (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
