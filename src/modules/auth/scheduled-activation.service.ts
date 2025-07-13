import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class ScheduledActivationService {
  private readonly logger = new Logger(ScheduledActivationService.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Gửi email nhắc nhở kích hoạt tài khoản cho users chưa kích hoạt sau 29 ngày
   * Mỗi user chỉ nhận được 1 email nhắc nhở duy nhất với link kích hoạt có hạn 24h
   * Chạy hàng ngày lúc 9:00 AM để kiểm tra và gửi cho các user mới đủ 29 ngày
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: 'send-activation-reminders',
  })
  async handleSendActivationReminders() {
    this.logger.log('Starting scheduled task: Send activation reminders');

    try {
      const result = await this.authService.sendActivationReminders();

      this.logger.log(`Activation reminders sent successfully. Success: ${result.success}, Failed: ${result.failed}`);
    } catch (error) {
      this.logger.error('Failed to send activation reminders:', error);
    }
  }

  /**
   * Xóa tài khoản users chưa kích hoạt sau 30 ngày đăng ký
   * Gửi email thông báo xóa tài khoản trước khi xóa
   * Chạy hàng ngày lúc 9:00 AM để xử lý các tài khoản đã quá hạn 24h sau khi nhận reminder
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: 'delete-inactive-counts',
  })
  async handleDeleteInactiveAccounts() {
    this.logger.log('Starting scheduled task: Delete inactive accounts');

    try {
      const result = await this.authService.deleteInactiveAccounts();

      this.logger.log(`Account deletion completed. Success: ${result.success}, Failed: ${result.failed}`);
    } catch (error) {
      this.logger.error('Failed to delete inactive accounts:', error);
    }
  }
}
