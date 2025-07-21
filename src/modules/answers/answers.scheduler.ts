import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnswersService } from './answers.service';

@Injectable()
export class AnswersScheduler {
  constructor(private readonly answersService: AnswersService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAutoSubmit() {
    await this.answersService.autoSubmitExpiredExams();
  }
}
