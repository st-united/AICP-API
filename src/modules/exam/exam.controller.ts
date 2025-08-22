import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { ResponseItem } from '@app/common/dtos';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { GetHistoryExamDto } from './dto/request/history-exam.dto';
import { HistoryExamResponseDto } from './dto/response/history-exam-response.dto';
import { Response } from 'express';
import * as dayjs from 'dayjs';
import { DATE_TIME } from '@Constant/datetime';
import { ExamWithResultDto, UserWithExamsResponseDto } from './dto/response/exam-with-result.dto';
import { VerifyExamResponseDto } from './dto/response/verify-exam-response.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('has-taken-exam')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã làm bài thi chưa' })
  @ApiQuery({ name: 'examSetName', type: String, description: 'Tên bộ đề' })
  async hasTakenExam(
    @Req() req,
    @Query('examSetName') examSetName: string
  ): Promise<ResponseItem<VerifyExamResponseDto>> {
    return await this.examService.hasTakenExam({
      userId: req.user.userId,
      examSetName,
    });
  }

  @Get('taken-input-test')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã làm bài thi Input test chưa' })
  hasTakenExamInputTest(@Req() req): Promise<ResponseItem<HasTakenExamResponseDto>> {
    return this.examService.hasTakenExamInputTest(req.user.userId);
  }

  @Get('has-scheduled')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã đặt lịch cho bài thi chưa' })
  @ApiQuery({ name: 'examSetName', type: String, description: 'Tên bộ đề' })
  async hasScheduled(@Req() req, @Query('examSetName') examSetName: string): Promise<ResponseItem<boolean>> {
    const userId = req.user.id;
    return await this.examService.canScheduleExam(userId, examSetName);
  }

  @Get('history-exam')
  @ApiOperation({ summary: 'Lấy lịch sử làm bài thi' })
  @ApiQuery({ name: 'startDate', type: Date, required: false })
  @ApiQuery({ name: 'endDate', type: Date, required: false })
  getHistoryExam(@Req() req, @Query() queries: GetHistoryExamDto): Promise<ResponseItem<HistoryExamResponseDto[]>> {
    return this.examService.getHistoryExam(req.user.userId, queries);
  }

  @Get('users-with-exams')
  @ApiOperation({
    summary: 'Lấy danh sách tất cả user với các bài exam của họ, hỗ trợ lọc theo ngày tạo tài khoản hoặc university',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: 'string',
    format: 'date',
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'university', required: false, type: 'string', description: 'Tên trường đại học' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách user và exams thành công',
    type: ResponseItem,
  })
  @ApiResponse({ status: 400, description: 'Lỗi khi lấy dữ liệu' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsersWithExams(
    @Query('fromDate') fromDateStr?: string,
    @Query('toDate') toDateStr?: string,
    @Query('university') university?: string
  ): Promise<ResponseItem<UserWithExamsResponseDto[]>> {
    const filters = {
      fromDate: fromDateStr ? new Date(fromDateStr) : undefined,
      toDate: toDateStr ? new Date(toDateStr) : undefined,
      university,
    };

    if (fromDateStr && isNaN(filters.fromDate.getTime())) {
      throw new BadRequestException('fromDate không hợp lệ');
    }
    if (toDateStr && isNaN(filters.toDate.getTime())) {
      throw new BadRequestException('toDate không hợp lệ');
    }

    return this.examService.getUsersWithExams(filters);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID của bài thi user' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.examService.getDetailExam(id);
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

  @Get(':id/download-certificate')
  @ApiOperation({ summary: 'Tải file chứng chỉ PDF của bài thi' })
  @ApiParam({ name: 'id', type: String, description: 'Exam ID' })
  async downloadCertificate(@Param('id', ParseUUIDPipe) id: string, @Req() req, @Res() res: Response): Promise<void> {
    const { buffer, date } = await this.examService.generateCertificateByExamId(id, req.user.userId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="AICompetency_Certificate_${dayjs(date).format(DATE_TIME.DAY_YYYY_MM_DD)}.pdf"`,
      'Content-Length': buffer.length,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    res.end(buffer);
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Lấy thông tin bộ đề thi theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID bộ đề thi' })
  async getExamWithResultById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req
  ): Promise<ResponseItem<ExamWithResultDto>> {
    return this.examService.getExamWithResult(id, req.user.userId);
  }
}
