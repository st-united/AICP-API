// src/modules/mentor-spots/dto/request/book-spot.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class BookSpotDto {
  @ApiProperty({ description: 'ID người dùng (mentee) booking' })
  @IsOptional()
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Exam cần đặt lịch phỏng vấn' })
  @IsString()
  examId!: string;

  @ApiProperty({ required: false, description: 'IANA timezone để map TimeSlotBooking', example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
