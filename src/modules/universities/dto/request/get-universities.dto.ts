import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUniversitiesDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number = 0;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  take?: number = 100;
}
