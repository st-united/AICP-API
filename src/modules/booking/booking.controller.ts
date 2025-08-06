import { Controller, Get, Param, Query, Post, Body, NotFoundException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingGateway } from './booking.gateway';

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
}
