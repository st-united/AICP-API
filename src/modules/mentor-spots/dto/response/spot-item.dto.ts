import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SpotItemDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty({ example: '09:00' }) @Expose() startLabel!: string;
  @ApiProperty({ example: '09:30' }) @Expose() endLabel!: string;
  @ApiProperty({ example: '2025-09-20T02:00:00.000Z' }) @Expose() startAt!: string;
  @ApiProperty({ example: '2025-09-20T02:30:00.000Z' }) @Expose() endAt!: string;
}

export class SpotsByDayDto {
  @ApiProperty({ example: '2025-09-20' }) @Expose() date!: string;

  @ApiProperty({ type: [SpotItemDto] })
  @Expose()
  @Type(() => SpotItemDto)
  slots!: SpotItemDto[];
}

export class SimpleRangeDto {
  @ApiProperty({ example: '2025-09-18' }) @Expose() from!: string;
  @ApiProperty({ example: '2025-09-25' }) @Expose() to!: string;
}

export class PaginationDto {
  @ApiProperty({ example: 1 }) @Expose() page!: number;
  @ApiProperty({ example: 20 }) @Expose() pageSize!: number;
  @ApiProperty({ example: 120 }) @Expose() total!: number;
}

// --- GET /mentors-spots/:mentorId
export class GetMentorSpotsResponseDto {
  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' }) @Expose() timezone!: string;

  @ApiProperty({ type: SimpleRangeDto })
  @Expose()
  @Type(() => SimpleRangeDto)
  range!: SimpleRangeDto;

  @ApiProperty({ type: PaginationDto })
  @Expose()
  @Type(() => PaginationDto)
  pagination!: PaginationDto;

  @ApiProperty({ type: [SpotsByDayDto] })
  @Expose()
  @Type(() => SpotsByDayDto)
  days!: SpotsByDayDto[];
}

// --- POST /mentors-spots/:mentorId (saveSpots)
export class SaveSpotsResponseDto {
  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' }) @Expose() timezone!: string;

  @ApiProperty({ type: [SpotsByDayDto] })
  @Expose()
  @Type(() => SpotsByDayDto)
  days!: SpotsByDayDto[];
}
