import { Controller, Get, Param, Query, Post, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingGateway } from './booking.gateway';
import { ExamSlotsReportDto } from './dto/exam-slots-report.dto';
import { ResponseItem } from '@app/common/dtos';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingGateway: BookingGateway
  ) {}

  @Get('available-slots/:examId')
  async getAvailableSlotsByExamId(
    @Param('examId', new ParseUUIDPipe()) examId: string
  ): Promise<ResponseItem<ExamSlotsReportDto>> {
    return await this.bookingService.getAvailableSlotsByExamId(examId);
  }

  @Get()
  async getInterviewRequests(@Query() filter: FilterMentorBookingRequestDto) {
    const users = await this.bookingService.findAllWithFilter(filter);
    return {
      message: 'Get interview requests successfully',
      data: users,
    };
  }
}
