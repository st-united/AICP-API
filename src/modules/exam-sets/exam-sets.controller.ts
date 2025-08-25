import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ExamSetsService } from './exam-sets.service';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetExamSetDto } from './dto/get-exam-set.dto';
import { ResponseItem } from '@app/common/dtos';
import { ExamSetResponseDto, FrameworkDto } from './dto/exam-set-response.dto';
@ApiTags('exam-sets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('exam-sets')
export class ExamSetsController {
  constructor(private readonly examSetsService: ExamSetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new exam set' })
  create(@Body() createExamSetDto: CreateExamSetDto) {
    return this.examSetsService.create(createExamSetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exam sets' })
  @ApiOkResponse({ type: [ExamSetResponseDto] })
  findAll(): Promise<ExamSetResponseDto[]> {
    return this.examSetsService.findAll();
  }

  @Get('input-test')
  @ApiOperation({ summary: 'Get exam set with questions' })
  async getExamSet(@Req() req: any, @Query('examSetName') examSetName?: string): Promise<ResponseItem<GetExamSetDto>> {
    const userId = req.user.userId;
    return await this.examSetsService.getExamSetWithQuestions(userId, examSetName);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamSetDto: UpdateExamSetDto) {
    return this.examSetsService.update(id, updateExamSetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examSetsService.remove(id);
  }
}
