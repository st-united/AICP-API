import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WindowDto {
  @ApiProperty({ example: '09:00' }) @IsString() start!: string; // HH:mm
  @ApiProperty({ example: '12:00' }) @IsString() end!: string; // HH:mm
}
class DayWindowsDto {
  @ApiProperty({ example: '2025-10-01' }) @IsString() date!: string; // yyyy-MM-dd
  @ApiProperty({ type: [WindowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WindowDto)
  windows!: WindowDto[];
}

export class UpsertMentorScheduleWithSpotsDto {
  // Schedule
  @ApiProperty({ example: 'Q4 Interview Week' }) @IsString() @MaxLength(150) name!: string;
  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' }) @IsString() timezone!: string;
  @ApiProperty({ example: 30 }) @IsInt() @Min(5) durationMin!: number;
  @ApiPropertyOptional({ example: 'Đợt phỏng vấn đầu Q4' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ example: '2025-10-01' }) @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional({ example: '2025-10-07' }) @IsOptional() @IsString() endDate?: string;

  // Spots
  @ApiProperty({ type: [DayWindowsDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayWindowsDto)
  days!: DayWindowsDto[];

  @ApiPropertyOptional({ example: 30, description: 'Nếu truyền sẽ override durationMin khi cắt slot' })
  @IsOptional()
  @IsInt()
  @Min(5)
  duration?: number;

  @ApiPropertyOptional({ example: true, description: 'Xoá AVAILABLE trong range trước khi tạo' })
  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean;
}
