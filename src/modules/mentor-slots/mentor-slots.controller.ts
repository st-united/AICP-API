import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MentorSlotsService } from './mentor-slots.service';
import { CreateMentorSlotsDto } from './dto/request/create-mentor-slots.dto';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { MentorCalendarResponseDto } from './dto/response/mentor-calendar-response.dto';
import { GetMentorCalendarQueryDto } from './dto/request/get-mentor-calendar.query.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';

@UseGuards(JwtAccessTokenGuard)
@Controller('mentor-slots')
export class MentorSlotsController {
  constructor(private readonly mentorSlotsService: MentorSlotsService) {}

  @Post()
  createSlots(@Req() req, @Body() dto: CreateMentorSlotsDto) {
    return this.mentorSlotsService.createBulkSlots(dto, req?.user?.userId);
  }

  @Get('calendar')
  @ApiOkResponse({ type: MentorCalendarResponseDto })
  getMentorCalendar(@Req() req, @Query() query: GetMentorCalendarQueryDto) {
    return this.mentorSlotsService.getMentorCalendar({
      mentorUserId: req?.user?.userId,
      ...query,
    });
  }

  @Get('calendar/week')
  @ApiQuery({ name: 'from', required: false, example: '2025-01-20' })
  @ApiQuery({ name: 'to', required: false, example: '2025-01-26' })
  async getWeekCalendar(@Req() req, @Query('from') from?: string, @Query('to') to?: string) {
    return this.mentorSlotsService.getMentorWeekCalendar(req.user.userId, from, to);
  }

  @Get('calendar/month')
  @ApiQuery({ name: 'month', required: true, example: '2025-01' })
  async getMonthCalendar(@Req() req, @Query('month') month: string) {
    return this.mentorSlotsService.getMentorMonthCalendar(req.user.userId, month);
  }
}
