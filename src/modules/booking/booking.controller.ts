import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import { FilterBookingDto } from './dto/filter-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @Get()
  getAll(@Query() filter: FilterBookingDto) {
    return this.service.getAll(filter);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.service.getDetail(id);
  }

  @Post('select')
  addToMyList(@Body('userIds') userIds: string[], @Body('mentorId') mentorId: string) {
    return this.service.addToMyList(userIds, mentorId);
  }
}
