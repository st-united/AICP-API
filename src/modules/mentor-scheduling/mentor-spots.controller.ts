import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MentorSchedulingService } from './mentor-scheduling.service';
import { SaveMentorSpotsDto } from './dto/request/save-mentor-spots.dto';
import { GetMentorSpotsQueryDto } from './dto/request/get-mentor-spots.dto';
import { GetAllMentorSpotsQueryDto } from './dto/request/get-all-mentor-spots.dto';
import { ResponseItem } from '@app/common/dtos';
import { GetMentorSpotsResponseDto, SaveSpotsResponseDto } from './dto/response/spot-item.dto';
import { GetAllMentorSpotsResponseDto } from './dto/response/get-all-mentor-spots.dto';
import { singleResponseSchema } from '@app/common/helpers/response-item.helper';
import { CancelBookedSpotDto } from './dto/request/cancel-booked-spot.dto';
import { BookSpotResponseDto } from './dto/response/book-spot-response.dto';
import { BookSpotDto } from './dto/request/book-spot.dto';

@ApiTags('Mentor Spots')
@ApiBearerAuth()
@ApiExtraModels(ResponseItem, GetMentorSpotsResponseDto, SaveSpotsResponseDto, GetAllMentorSpotsResponseDto)
@Controller('mentor-spots')
export class MentorSpotsController {
  constructor(private readonly service: MentorSchedulingService) {}

  @ApiOperation({ summary: 'Tạo/ghi đè các available spots cho mentor' })
  @ApiParam({ name: 'mentorId', required: true })
  @ApiBody({ type: SaveMentorSpotsDto })
  @ApiOkResponse(singleResponseSchema(SaveSpotsResponseDto))
  @Post(':mentorId')
  createSpots(@Param('mentorId') mentorId: string, @Body() dto: SaveMentorSpotsDto) {
    return this.service.saveSpots(mentorId, dto);
  }

  @ApiOperation({ summary: 'Lấy available spots của 1 mentor (theo range, TZ, có pagination)' })
  @ApiParam({ name: 'mentorId', required: true })
  @ApiOkResponse(singleResponseSchema(GetMentorSpotsResponseDto))
  @Get(':mentorId')
  getAvailableSpots(@Param('mentorId') mentorId: string, @Query() q: GetMentorSpotsQueryDto) {
    return this.service.getAvailableSpots(mentorId, q);
  }

  @ApiOperation({ summary: 'Lấy tất cả mentors có available spots (phân trang theo mentor)' })
  @ApiOkResponse(singleResponseSchema(GetAllMentorSpotsResponseDto))
  @Get()
  getAllAvailableSpots(@Query() q: GetAllMentorSpotsQueryDto) {
    return this.service.getAllAvailableSpots(q);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'User book 1 spot (tạo InterviewRequest + cập nhật Exam)' })
  @ApiParam({ name: 'spotId', required: true })
  @ApiBody({ type: BookSpotDto })
  @ApiOkResponse(singleResponseSchema(BookSpotResponseDto))
  @Post(':spotId/book')
  async bookSpot(@Param('spotId') spotId: string, @Body() dto: BookSpotDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.service.bookSpot(spotId, { ...dto, userId });
  }

  @ApiOperation({ summary: 'Hủy booking: xóa InterviewRequest, trả spot về AVAILABLE' })
  @ApiParam({ name: 'spotId', required: true })
  @ApiBody({ type: CancelBookedSpotDto })
  @ApiOkResponse(singleResponseSchema(BookSpotResponseDto))
  @Post(':spotId/cancel')
  async cancelBookedSpot(@Param('spotId') spotId: string, @Body() body: CancelBookedSpotDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.service.cancelBookedSpot(spotId, body.examId, userId);
  }
}
