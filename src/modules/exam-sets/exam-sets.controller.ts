import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExamSetsService } from './exam-sets.service';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetExamSetDto } from './dto/get-exam-set.dto';
import { ResponseItem } from '@app/common/dtos';
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
  findAll() {
    return this.examSetsService.findAll();
  }

  @Get('input-test')
  @ApiOperation({ summary: 'Get exam set with questions' })
  async getExamSet(): Promise<ResponseItem<GetExamSetDto>> {
    return await this.examSetsService.getExamSetWithQuestions();
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
