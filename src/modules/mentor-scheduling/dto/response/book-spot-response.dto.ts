// src/modules/mentor-spots/dto/response/book-spot-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BookSpotResponseDto {
  @ApiProperty() @Expose() spotId!: string;
  @ApiProperty() @Expose() mentorId!: string;
  @ApiProperty() @Expose() examId!: string;
  @ApiProperty() @Expose() interviewRequestId!: string;
  @ApiProperty({ example: '2025-09-20T02:00:00.000Z' }) @Expose() startAt!: string;
  @ApiProperty({ example: '2025-09-20T03:00:00.000Z' }) @Expose() endAt!: string;
  @ApiProperty({ example: 'BOOKED' }) @Expose() status!: string;
}
