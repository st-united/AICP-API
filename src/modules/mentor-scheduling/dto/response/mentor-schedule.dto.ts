import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MentorScheduleResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() mentorId: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() timezone: string;
  @ApiProperty() @Expose() durationMin: number;
  @ApiProperty({ required: false }) @Expose() notes?: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty({ required: false }) @Expose() startDate?: string;
  @ApiProperty({ required: false }) @Expose() endDate?: string;
}
