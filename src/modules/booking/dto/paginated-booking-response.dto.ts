import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsInt, Min, IsString } from 'class-validator';
import { FilterBookingResponseItemDto } from './filter-booking-response-item.dto';

export class PaginatedBookingResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterBookingResponseItemDto)
  data: FilterBookingResponseItemDto[];

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

  @IsArray()
  @IsString({ each: true })
  levels: string[];
}
