import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MentorsService } from './mentors.service';

@Injectable()
export class ScheduledMentorReminderService {
  constructor(private readonly mentorsService: MentorsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: 'send-mentor-interview-reminders',
  })
  async handleSendMentorReminders() {
    await this.mentorsService.sendInterviewReminders();
  }
}
