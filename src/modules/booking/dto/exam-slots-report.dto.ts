import { ApiProperty } from '@nestjs/swagger';
import { SlotStatus } from '@prisma/client';

class SlotAvailabilityDto {
  @ApiProperty({ example: 8, description: 'Số slot còn trống trong buổi sáng hoặc buổi chiều' })
  slot: number;

  @ApiProperty({ enum: SlotStatus, description: 'Trạng thái slot (AVAILABLE, ALMOST_FULL, FULL)' })
  status: SlotStatus;
}

export class DailyAvailabilityDto {
  @ApiProperty({ example: '2025-08-07', description: 'Ngày phỏng vấn (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ type: SlotAvailabilityDto, description: 'Số slot buổi sáng' })
  morning: SlotAvailabilityDto;

  @ApiProperty({ type: SlotAvailabilityDto, description: 'Số slot buổi chiều' })
  afternoon: SlotAvailabilityDto;
}

export class ExamSlotsReportDto {
  @ApiProperty({
    type: [DailyAvailabilityDto],
    description: 'Danh sách slot còn trống cho từng ngày',
  })
  days: DailyAvailabilityDto[];
}
