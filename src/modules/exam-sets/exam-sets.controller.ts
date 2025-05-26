import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExamSetsService } from './exam-sets.service';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

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
  @Get(':id')
  @ApiOperation({ summary: 'Get exam set with questions' })
  async getExamSet(@Param('id') id: string) {
    return this.examSetsService.getExamSetWithQuestions(id);
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
