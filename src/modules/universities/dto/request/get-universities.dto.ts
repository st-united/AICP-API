import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { extend } from 'joi';
import { PageOptionsDto } from '@app/common/dtos';

export class GetUniversitiesDto extends PageOptionsDto {
  @IsString()
  @IsOptional()
  search?: string;
}
