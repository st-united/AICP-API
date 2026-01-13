import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MentorCalendarItemDto } from './mentor-calendar-item.dto';

export class MentorCalendarResponseDto {
  @Expose()
  @Type(() => MentorCalendarItemDto)
  @ApiProperty({ type: [MentorCalendarItemDto] })
  data: MentorCalendarItemDto[];
}
