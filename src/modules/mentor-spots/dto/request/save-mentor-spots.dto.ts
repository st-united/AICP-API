import { Type } from 'class-transformer';
import { ArrayMinSize, IsBoolean, IsIn, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';

export class WindowDto {
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'start must be HH:mm (00:00-23:59)' })
  start!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'end must be HH:mm (00:00-23:59)' })
  end!: string;
}

export class DayInputDto {
  // YYYY-MM-DD theo timezone người dùng (IANA tz ở payload)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date!: string;

  @ValidateNested({ each: true })
  @Type(() => WindowDto)
  @ArrayMinSize(1)
  windows!: WindowDto[];
}

export class SaveMentorSpotsDto {
  @IsString()
  timezone!: string; // ví dụ: "Asia/Ho_Chi_Minh" (validate sâu ở service bằng Luxon)

  @IsIn([30, 60, 120], { message: 'duration must be one of 30, 60, 120 (minutes)' })
  duration!: number;

  @ValidateNested({ each: true })
  @Type(() => DayInputDto)
  @ArrayMinSize(1)
  days!: DayInputDto[];

  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean; // default true
}
