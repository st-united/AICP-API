import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMentorSpotsQueryDto {
  @IsString()
  timezone!: string; // IANA TZ, ví dụ: 'Asia/Ho_Chi_Minh'

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
  @Transform(({ value }) => (value != null ? Number(value) : 500))
  @IsInt()
  @Min(1)
  pageSize?: number = 500; // có thể điều chỉnh tuỳ nhu cầu
}
