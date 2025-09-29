import { IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { University } from '@app/modules/universities/dto/university.dto';

export class PaginatedResponseDto {
  @IsArray()
  @Type(() => University)
  data: University[];

  @IsInt()
  @Min(0)
  total: number;

  @IsInt()
  @Min(0)
  skip: number;

  @IsInt()
  @Min(1)
  take: number;
}
