import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { GetMentorsDto } from './dto/request/get-mentors.dto';
import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import { GetMenteesDto } from './dto/request/get-mentees.dto';
import { MenteesByMentorIdDto } from './dto/response/mentees-response.dto';
import { GetAvailableMentorsDto } from './dto/request/get-available-mentors.dto';
import { CreateMentorBookingDto } from './dto/request/create-mentor-booking.dto';
import { SimpleResponse } from '@app/common/dtos/base-response-item.dto';
import { MentorBookingResponseDto } from './dto/response/mentor-booking.dto';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Post()
  async create(@Body() createMentorDto: CreateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    return await this.mentorsService.create(createMentorDto);
  }

  @Post('create-scheduler')
  async createScheduler(@Body() dto: CreateMentorBookingDto): Promise<SimpleResponse<MentorBookingResponseDto>> {
    return await this.mentorsService.createScheduler(dto);
  }

  @Get()
  async findAll(@Query() getMentors: GetMentorsDto): Promise<ResponsePaginate<MentorResponseDto>> {
    return await this.mentorsService.getMentors(getMentors);
  }

  @Get('available')
  getAvailableMentors(@Query() query: GetAvailableMentorsDto) {
    return this.mentorsService.getAvailableMentors(query);
  }

  @Get('booked-slots')
  async getBookedSlotsByMentor(@Query('mentorId') mentorId: string) {
    return this.mentorsService.getGroupedBookedSlotsByMentor(mentorId);
  }

  @Get('/stats')
  async getMentorStats(): Promise<ResponseItem<MentorStatsDto>> {
    return await this.mentorsService.getMentorStats();
  }

  @Get('/mentees')
  async getMentees(@Query() getMentees: GetMenteesDto): Promise<ResponsePaginate<MenteesByMentorIdDto>> {
    return await this.mentorsService.getMenteesByMentorId(getMentees);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.mentorsService.getMentor(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMentorDto: UpdateMentorDto) {
    return await this.mentorsService.updateMentor(id, updateMentorDto);
  }

  @Patch('/activate/:id')
  async activateMentorAccount(@Param('id', ParseUUIDPipe) id: string) {
    return await this.mentorsService.activateMentorAccount(id);
  }

  @Delete(':id')
  async deactivateMentorAccount(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseItem<null>> {
    return await this.mentorsService.deactivateMentorAccount(id);
  }
}
