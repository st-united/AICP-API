import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MentorSchedulingService } from './mentor-scheduling.service';
import { ResponseItem } from '@app/common/dtos';
import { singleResponseSchema } from '@app/common/helpers/response-item.helper';
import { GetMentorSpotsResponseDto } from './dto/response/spot-item.dto';
import { GetMentorSpotsQueryDto } from './dto/request/get-mentor-spots.dto';
import { UpsertMentorScheduleWithSpotsDto } from './dto/request/upsert-mentor-schedule-with-spots.dto';
import { UpdateMentorScheduleDto } from './dto/request/update-mentor-schedule.dto';
import { MentorScheduleResponseDto } from './dto/response/mentor-schedule.dto';

@ApiTags('Mentor Schedules')
@ApiBearerAuth()
@ApiExtraModels(ResponseItem, MentorScheduleResponseDto, GetMentorSpotsResponseDto)
@Controller('mentor-schedules')
export class MentorSchedulesController {
  constructor(private readonly service: MentorSchedulingService) {}

  @ApiOperation({ summary: 'Tạo/ghi đè schedule + generate spots (một form)' })
  @ApiParam({ name: 'mentorId', required: true })
  @ApiOkResponse(singleResponseSchema(MentorScheduleResponseDto))
  @Post(':mentorId/upsert')
  upsert(@Param('mentorId') mentorId: string, @Body() dto: UpsertMentorScheduleWithSpotsDto) {
    return this.service.upsertScheduleWithSpots(mentorId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật schedule meta hoặc regenerate spots nếu có days' })
  @ApiParam({ name: 'scheduleId', required: true })
  @ApiOkResponse(singleResponseSchema(MentorScheduleResponseDto))
  @Patch(':scheduleId')
  update(@Param('scheduleId') scheduleId: string, @Body() dto: UpdateMentorScheduleDto) {
    return this.service.updateScheduleWithSpots(scheduleId, dto);
  }

  @ApiOperation({ summary: 'Lấy spots theo schedule' })
  @ApiParam({ name: 'scheduleId', required: true })
  @ApiOkResponse(singleResponseSchema(GetMentorSpotsResponseDto))
  @Get(':scheduleId/spots')
  spots(@Param('scheduleId') scheduleId: string, @Query() q: GetMentorSpotsQueryDto) {
    return this.service.getSpotsBySchedule(scheduleId, q);
  }

  @ApiOperation({ summary: 'Chi tiết schedule' })
  @ApiParam({ name: 'scheduleId', required: true })
  @ApiOkResponse(singleResponseSchema(MentorScheduleResponseDto))
  @Get(':scheduleId')
  detail(@Param('scheduleId') scheduleId: string) {
    return this.service.getScheduleDetail(scheduleId);
  }

  @ApiOperation({ summary: 'Danh sách schedules (tuỳ chọn lọc theo mentorId)' })
  @ApiQuery({ name: 'mentorId', required: false })
  @ApiOkResponse(singleResponseSchema(MentorScheduleResponseDto as any))
  @Get()
  list(@Query('mentorId') mentorId?: string) {
    return this.service.listSchedules(mentorId);
  }
}
