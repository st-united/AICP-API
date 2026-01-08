import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InterviewReminderService } from '@app/modules/interview-reminder/interview-reminder.service';

@Injectable()
export class InterviewReminderScheduler {
  constructor(private readonly interviewReminderService: InterviewReminderService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: 'interview-reminder',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDailyInterviewReminder(): Promise<void> {
    try {
      const result = await this.interviewReminderService.sendInterviewReminders();
      console.log('Daily interview reminder job completed:', result);
    } catch (error) {
      console.error('Error in daily interview reminder job:', error);
    }
  }
}
