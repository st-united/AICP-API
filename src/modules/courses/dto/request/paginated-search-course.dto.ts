import { PageOptionsDto } from '@app/common/dtos';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumberString, IsArray, IsBoolean } from 'class-validator';

export class PaginatedSearchCourseDto extends PageOptionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  })
  domains?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
  })
  status?: boolean;
}
