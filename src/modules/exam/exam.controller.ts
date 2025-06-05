import { Controller, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ResponseItem } from '@app/common/dtos';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { GetHistoryExamDto } from './dto/request/history-exam.dto';
import { HistoryExamResponseDto } from './dto/response/history-exam-response.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('taken-input-test')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã làm bài thi Input test chưa' })
  hasTakenExamInputTest(@Req() req): Promise<ResponseItem<HasTakenExamResponseDto>> {
    return this.examService.hasTakenExamInputTest(req.user.id);
  }

  @Get('history-exam')
  @ApiOperation({ summary: 'Lấy lịch sử làm bài thi' })
  @ApiQuery({ name: 'startDate', type: Date, required: false })
  @ApiQuery({ name: 'endDate', type: Date, required: false })
  getHistoryExam(@Req() req, @Query() queries: GetHistoryExamDto): Promise<ResponseItem<HistoryExamResponseDto[]>> {
    return this.examService.getHistoryExam(req.user.userId, queries);
  }

  @Get('has-taken-exam/:examSetId')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã làm bài thi chưa' })
  @ApiParam({ name: 'examSetId', type: String, description: 'ID bộ đề' })
  hasTakenExam(
    @Req() req,
    @Param('examSetId', ParseUUIDPipe) examSetId: string
  ): Promise<ResponseItem<HasTakenExamResponseDto>> {
    return this.examService.hasTakenExam({
      userId: req.user.id,
      examSetId,
    });
  }
}
