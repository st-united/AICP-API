import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { userAnswerDto } from './dto/request/user-answer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateStatusSubmitDto } from './dto/request/update-status-submit-answer.dto';
import { JwtAccessTokenGuard } from '@app/modules/auth/guards/jwt-access-token.guard';
import { Req } from '@nestjs/common';

@ApiTags('answers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  async create(@Req() req, @Body() dto: userAnswerDto): Promise<string> {
    return await this.answersService.create(req.user.userId, dto);
  }

  @Patch(':examSetId')
  update(
    @Req() req,
    @Param('examSetId') examSetId: string,
    @Body() UpdateStatusSubmitDto: UpdateStatusSubmitDto
  ): Promise<string> {
    return this.answersService.update(req.user.userId, examSetId, UpdateStatusSubmitDto);
  }
}
