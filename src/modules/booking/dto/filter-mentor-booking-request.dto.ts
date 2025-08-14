import { IsOptional, IsString, IsNumberString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
export class FilterMentorBookingRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value.filter((item) => item && item.trim() !== '');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return undefined;
  })
  levels?: string[];

  @IsOptional()
  @IsString()
  dateStart?: string;

  @IsOptional()
  @IsString()
  dateEnd?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
