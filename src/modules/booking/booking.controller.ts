import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingGateway } from './booking.gateway';
import { FilterBookingDto } from './dto/filter-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly service: BookingService,
    private readonly bookingGateway: BookingGateway
  ) {}
}
