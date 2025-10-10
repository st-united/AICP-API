import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';
import { Expose } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateExamDto extends PartialType(CreateExamDto) {}

export class UpdateTestTimeDto {
  @Expose()
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  startedAt?: Date;

  @Expose()
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  finishedAt?: Date;
}
