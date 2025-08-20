import { Controller, Get, Param, Query, Post, Body, ParseUUIDPipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingGateway } from './booking.gateway';
import { ExamSlotsReportDto } from './dto/exam-slots-report.dto';
import { ResponseItem } from '@app/common/dtos';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingGateway: BookingGateway
  ) {}

  @Get('interview-info/:examId')
  async getInterviewInfo(@Param('examId') examId: string) {
    return await this.bookingService.getUserInformationForInterview(examId);
  }
  @Get('available-slots/:examId')
  async getAvailableSlotsByExamId(
    @Param('examId', new ParseUUIDPipe()) examId: string
  ): Promise<ResponseItem<ExamSlotsReportDto>> {
    return await this.bookingService.getAvailableSlotsByExamId(examId);
  }
}
