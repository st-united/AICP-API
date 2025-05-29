import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ResponseItem } from '@app/common/dtos';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

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
