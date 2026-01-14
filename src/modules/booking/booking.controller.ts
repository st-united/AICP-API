import { Controller, Get, Param, Query, Post, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingGateway } from './booking.gateway';
import { ExamSlotsReportDto } from './dto/exam-slots-report.dto';
import { ResponseItem } from '@app/common/dtos';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetAvailableSlotsQueryDto } from './dto/get-available-slots-query.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
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
    @Param('examId', new ParseUUIDPipe()) examId: string,
    @Query() query: GetAvailableSlotsQueryDto
  ): Promise<ResponseItem<ExamSlotsReportDto>> {
    return await this.bookingService.getAvailableSlotsByExamId(examId, query);
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
