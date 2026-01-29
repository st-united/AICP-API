// src/modules/mentors/dto/response/mentor-calendar-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MentorSpotStatus } from '@Constant/enums';
import { InterviewInfoDto } from './interview-info.dto';

export class MentorCalendarItemDto {
  @Expose()
  @ApiProperty({ example: 'slot-uuid' })
  id: string;

  @Expose()
  @ApiProperty({ example: '2025-08-07T08:00:00Z' })
  startAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-08-07T09:00:00Z' })
  endAt: Date;

  @Expose()
  @ApiProperty({ enum: MentorSpotStatus })
  status: MentorSpotStatus;

  @Expose()
  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Expose()
  @ApiProperty({ example: 'https://aicp.devplus.edu.vn/meet/slot-uuid', nullable: true })
  meetUrl: string | null;

  @Expose()
  @Type(() => InterviewInfoDto)
  @ApiProperty({ type: InterviewInfoDto, nullable: true })
  interview: InterviewInfoDto | null;
}
