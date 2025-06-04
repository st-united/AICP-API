import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class GetHistoryExamDto {
  @Expose()
  @IsOptional()
  userId?: string;

  @Expose()
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Expose()
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;
}
