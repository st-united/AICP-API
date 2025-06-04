import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class GetHistoryExamDto {
  @Expose()
  @IsOptional()
  userId?: string;

  @Expose()
  @ApiProperty()
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Expose()
  @ApiProperty()
  @IsDate()
  @IsOptional()
  endDate?: Date;
}
