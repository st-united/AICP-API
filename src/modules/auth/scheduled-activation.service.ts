import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class ScheduledActivationService {
  constructor(private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: 'send-activation-reminders',
  })
  async handleSendActivationReminders() {
    await this.authService.sendActivationReminders();
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: 'delete-inactive-counts',
  })
  async handleDeleteInactiveAccounts() {
    await this.authService.deleteInactiveAccounts();
  }
}
