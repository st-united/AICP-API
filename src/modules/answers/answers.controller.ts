import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { userAnswerDto } from './dto/request/user-answer.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@app/modules/auth/guards/jwt-access-token.guard';
import { Req } from '@nestjs/common';
import { ResponseItem } from '@app/common/dtos';

@ApiTags('answers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit an answer to a question',
    description: `Used to submit a user's answer for a specific question within an exam set.
  
  - For choice-based questions (e.g., **single-choice**, **multiple-choice**, **true/false**), provide \`answerId\`.
  - For open-ended questions (e.g., **writing**), provide the free-text \`answer\`.`,
  })
  @ApiResponse({
    status: 201,
    description: 'Answer submitted successfully.',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiBody({ type: userAnswerDto })
  async create(@Req() req, @Body() dto: userAnswerDto): Promise<ResponseItem<userAnswerDto>> {
    return await this.answersService.create(req.user.userId, dto);
  }

  @Patch(':examId')
  @ApiOperation({
    summary: 'Submit the entire exam',
    description: `Call this endpoint after answering all questions to finalize and submit the entire exam.  
    The system will calculate the total score based on the previously submitted answers.`,
  })
  @ApiParam({
    name: 'examId',
    required: true,
    description: 'ID of the exam to submit',
    example: 'exam-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam submitted and scored successfully.',
    type: String,
  })
  @ApiResponse({
    status: 404,
    description: 'Exam not found or user not authorized.',
  })
  update(@Req() req, @Param('examId') examId: string): Promise<ResponseItem<userAnswerDto>> {
    return this.answersService.update(req.user.userId, examId);
  }
}
