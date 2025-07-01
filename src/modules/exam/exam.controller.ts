import { Controller, Delete, Get, Param, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ResponseItem } from '@app/common/dtos';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
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
    return this.examService.hasTakenExamInputTest(req.user.userId);
  }

  @Get('history-exam')
  @ApiOperation({ summary: 'Lấy lịch sử làm bài thi' })
  @ApiQuery({ name: 'startDate', type: Date, required: false })
  @ApiQuery({ name: 'endDate', type: Date, required: false })
  getHistoryExam(@Req() req, @Query() queries: GetHistoryExamDto): Promise<ResponseItem<HistoryExamResponseDto[]>> {
    return this.examService.getHistoryExam(req.user.userId, queries);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID của bài thi user' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.examService.getDetailExam(id);
  }

  @Get('has-taken-exam/:examSetId')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã làm bài thi chưa' })
  @ApiParam({ name: 'examSetId', type: String, description: 'ID bộ đề' })
  hasTakenExam(
    @Req() req,
    @Param('examSetId', ParseUUIDPipe) examSetId: string
  ): Promise<ResponseItem<HasTakenExamResponseDto>> {
    return this.examService.hasTakenExam({
      userId: req.user.userId,
      examSetId,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá bài làm theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'Exam ID cần xoá' })
  @ApiResponse({
    status: 200,
    description: 'Xoá bài làm thành công',
    type: ResponseItem<HasTakenExamResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bài làm',
  })
  async deleteExam(@Param('id') examId: string): Promise<ResponseItem<HasTakenExamResponseDto>> {
    return this.examService.deleteExam(examId);
  }
}
