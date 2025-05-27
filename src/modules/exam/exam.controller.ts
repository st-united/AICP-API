import { Controller, Get, Query } from '@nestjs/common';
import { ExamService } from './exam.service';
import { HasTakenExamDto } from './dto/request/has-taken-exam.dto';
import { ResponseItem } from '@app/common/dtos';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('has-taken-exam')
  hasTakenExam(@Query() queries: HasTakenExamDto): Promise<ResponseItem<HasTakenExamResponseDto>> {
    return this.examService.hasTakenExam(queries);
  }
}
