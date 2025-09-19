import { IsOptional, IsString, Matches, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllMentorSpotsQueryDto {
  @IsString()
  timezone!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be YYYY-MM-DD' })
  to?: string;

  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : 1))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : 10))
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
