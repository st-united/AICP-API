import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { GetMentorsDto } from './dto/request/get-mentors.dto';
import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import { CreateMentorBookingDto } from './dto/request/create-mentor-booking.dto';
import { MentorBookingResponseDto } from './dto/response/mentor-booking.dto';
import { ActivateAccountDto } from './dto/request/activate-account.dto';
import { BookingGateway } from '../booking/booking.gateway';
import { FilterMentorBookingDto } from './dto/request/filter-mentor-booking.dto';
import { PaginatedMentorBookingResponseDto } from './dto/response/paginated-booking-response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckInterviewRequestDto } from './dto/request/check-interview-request.dto';
import { CheckInterviewRequestResponseDto } from './dto/response/check-interview-request-response.dto';
import { AssignMentorDto } from './dto/response/assign-mentor.dto';
import { AssignMentorResultDto } from './dto/response/assign-mentor-result.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('mentors')
export class MentorsController {
  constructor(
    private readonly mentorsService: MentorsService,
    private readonly bookingGateway: BookingGateway
  ) {}

  @Post()
  async create(@Body() createMentorDto: CreateMentorDto, @Req() req): Promise<ResponseItem<MentorResponseDto>> {
    const url = req.headers.origin;
    return await this.mentorsService.create(createMentorDto, url);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('create-scheduler')
  @UseGuards(JwtAccessTokenGuard)
  async createScheduler(
    @Req() req,
    @Body() dto: CreateMentorBookingDto
  ): Promise<ResponseItem<MentorBookingResponseDto>> {
    const newBooking = await this.mentorsService.createScheduler(dto);
    await this.bookingGateway.notifySlotUpdate(dto.examId);
    this.bookingGateway.emitNewBooking();
    return newBooking;
  }

  @Get('/stats')
  async getMentorStats(): Promise<ResponseItem<MentorStatsDto>> {
    return await this.mentorsService.getMentorStats();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.mentorsService.getMentor(id);
  }
  @Patch('activate-link-account')
  async activateAccountByMentor(@Body() activateAccountDto: ActivateAccountDto, @Req() req) {
    const url = req.headers.origin;
    return await this.mentorsService.activateAccountByMentor(activateAccountDto.token, url);
  }
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMentorDto: UpdateMentorDto) {
    return await this.mentorsService.updateMentor(id, updateMentorDto);
  }

  @Patch('/activate/:id')
  async activateMentorAccount(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const url = req.headers.origin;
    return await this.mentorsService.activateMentorAccount(id, url);
  }

  @Delete(':id')
  async deactivateMentorAccount(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<ResponseItem<null>> {
    const url = req.headers.origin;
    return await this.mentorsService.deactivateMentorAccount(id, url);
  }

  @Get()
  @UseGuards(JwtAccessTokenGuard)
  async getFilteredBookings(
    @Req() req: any,
    @Query() dto: FilterMentorBookingDto
  ): Promise<ResponseItem<PaginatedMentorBookingResponseDto>> {
    return this.mentorsService.getFilteredBookings(dto, req.user.userId);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('check-interview-request')
  @ApiOperation({ summary: 'Check if user has an interview request' })
  @ApiResponse({ status: 200, description: 'Interview request check completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID or error checking interview request' })
  async checkUserInterviewRequest(
    @Body() checkInterviewRequestDto: CheckInterviewRequestDto
  ): Promise<ResponseItem<CheckInterviewRequestResponseDto>> {
    return await this.mentorsService.checkUserInterviewRequest(checkInterviewRequestDto.userId);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('check-my-interview-request/:examId')
  @ApiOperation({ summary: 'Check if current user has an interview request' })
  @ApiResponse({ status: 200, description: 'Interview request check completed successfully' })
  @ApiResponse({ status: 400, description: 'Error checking interview request' })
  async checkMyInterviewRequest(
    @Param('examId', ParseUUIDPipe) examId: string
  ): Promise<ResponseItem<CheckInterviewRequestResponseDto>> {
    return await this.mentorsService.checkUserInterviewRequest(examId);
  }

  @Post('assign')
  async assignMentor(@Body() dto: AssignMentorDto, @Req() req): Promise<ResponseItem<AssignMentorResultDto>> {
    const result = await this.mentorsService.assignMentorToRequests(dto, req.user.userId);
    await this.bookingGateway.emitNewBooking();
    return result;
  }
}
