import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsInt, Min } from 'class-validator';
import { CourseResponseDto } from './course-response.dto';

export class PaginatedSearchCourseResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseResponseDto)
  data: CourseResponseDto[];

  @IsInt()
  @Min(0)
  total: number;

  @IsInt()
  @Min(1)
  page: number;

  @IsInt()
  @Min(1)
  limit: number;

  @IsInt()
  @Min(1)
  totalPages: number;
}
