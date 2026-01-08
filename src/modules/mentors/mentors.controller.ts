import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import { CreateMentorBookingDto } from './dto/request/create-mentor-booking.dto';
import { MentorBookingResponseDto, MentorDto } from '@app/modules/mentors/dto/response/mentor-booking.dto';
import { ActivateAccountDto } from './dto/request/activate-account.dto';
import { BookingGateway } from '../booking/booking.gateway';
import { FilterMentorBookingDto } from './dto/request/filter-mentor-booking.dto';
import { PaginatedMentorBookingResponseDto } from './dto/response/paginated-booking-response.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { AssignMentorDto } from './dto/response/assign-mentor.dto';
import { AssignMentorResultDto } from './dto/response/assign-mentor-result.dto';
import { CheckInterviewRequestResponseDto } from './dto/response/check-interview-request-response.dto';
import { GetExamResultDto } from './dto/response/get-exam-result.dto';
import { AspectExvaluationDto } from './dto/response/aspect-exvaluation.dto';
import { SubmitAspectExvaluationRequestDto } from './dto/request/submit-aspect-evalution-request.dto';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchMentorRequestDto } from '@app/modules/mentors/dto/request/search-mentor-request.dto';
import { RequestCustom } from '@app/common/interfaces';
import { GetBookingByMentorRequestDto } from '@app/modules/mentors/dto/request/get-booking-by-mentor-request.dto';

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

  @Get()
  @UseGuards(JwtAccessTokenGuard)
  async getFilteredBookings(
    @Req() req: RequestCustom,
    @Query() dto: FilterMentorBookingDto
  ): Promise<ResponseItem<PaginatedMentorBookingResponseDto>> {
    return this.mentorsService.getFilteredBookings(dto, req.user.userId);
  }

  @Get('v2')
  @UseGuards(JwtAccessTokenGuard)
  async getMentorsByParams(@Query() dto: SearchMentorRequestDto): Promise<ResponsePaginate<MentorDto>> {
    return this.mentorsService.getMentorsByParams(dto);
  }

  @Get('bookings')
  @UseGuards(JwtAccessTokenGuard)
  async getBookingByMentor(
    @Query() dto: GetBookingByMentorRequestDto
  ): Promise<ResponsePaginate<MentorBookingResponseDto>> {
    return this.mentorsService.getBookingByMentor(dto);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('create-scheduler')
  @UseGuards(JwtAccessTokenGuard)
  async createScheduler(
    @Req() req,
    @Body() dto: CreateMentorBookingDto
  ): Promise<ResponseItem<MentorBookingResponseDto>> {
    const newBooking = await this.mentorsService.createScheduler(req.user.userId, dto);
    await this.bookingGateway.notifySlotUpdate(dto.examId);
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

  @Post('assign')
  async assignMentor(@Body() dto: AssignMentorDto, @Req() req): Promise<ResponseItem<AssignMentorResultDto>> {
    const result = await this.mentorsService.assignMentorToRequests(dto, req.user.userId, req.user.email);
    return result;
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

  @UseGuards(JwtAccessTokenGuard)
  @Get('exam-by-booking/:mentorBookingId/result')
  @ApiOperation({ summary: 'Get exam result by mentor booking ID' })
  @ApiResponse({ status: 200, description: 'Exam result retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Error retrieving exam result' })
  async getExamResultByBooking(
    @Param('mentorBookingId', ParseUUIDPipe) mentorBookingId: string,
    @Req() userCurrent
  ): Promise<ResponseItem<GetExamResultDto>> {
    return await this.mentorsService.getExamResultByBooking(mentorBookingId, userCurrent.user.userId);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('aspect-evaluation')
  @ApiOperation({ summary: 'Generate aspect evaluation for a given mentor booking ID' })
  @ApiResponse({ status: 200, description: 'Aspect evaluation generated successfully' })
  @ApiResponse({ status: 400, description: 'Error generating aspect evaluation' })
  async generateAspectEvaluation(
    @Body('mentorBookingId', ParseUUIDPipe) mentorBookingId: string,
    @Req() userCurrent
  ): Promise<ResponseItem<AspectExvaluationDto>> {
    return await this.mentorsService.generateAspectEvaluation(mentorBookingId, userCurrent.user.userId);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('aspect-evaluation/:evaluationId')
  @ApiOperation({ summary: 'Get aspect evaluation for a given evaluation ID' })
  @ApiResponse({ status: 200, description: 'Aspect evaluation retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Error retrieving aspect evaluation' })
  async getAspectEvaluation(
    @Param('evaluationId', ParseUUIDPipe) evaluationId: string,
    @Req() userCurrent
  ): Promise<ResponseItem<AspectExvaluationDto>> {
    return await this.mentorsService.getAspectEvaluation(evaluationId, userCurrent.userId);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('aspect-evaluation/:evaluationId/submit')
  @ApiOperation({ summary: 'Submit aspect evaluation for a given evaluation ID' })
  @ApiResponse({ status: 200, description: 'Aspect evaluation submitted successfully' })
  @ApiResponse({ status: 400, description: 'Error submitting aspect evaluation' })
  async submitAspectEvaluation(
    @Param('evaluationId', ParseUUIDPipe) evaluationId: string,
    @Body() request: SubmitAspectExvaluationRequestDto
  ) {
    return await this.mentorsService.submitAspectEvaluation(evaluationId, request);
  }
}
