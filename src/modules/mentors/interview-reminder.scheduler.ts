import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InterviewRequestStatus } from '@prisma/client';
import * as dayjs from 'dayjs';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const REMINDER_WINDOW_MINUTES = 5;
const VIETNAMESE_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

@Injectable()
export class InterviewReminderScheduler {
  private readonly logger = new Logger(InterviewReminderScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleInterviewReminders() {
    try {
      await Promise.all([this.processWindow('1d', 24 * 60), this.processWindow('15m', 15)]);
    } catch (error) {
      this.logger.error('Failed to process interview reminders', error);
    }
  }

  private async processWindow(type: '1d' | '15m', minutesBefore: number) {
    const now = dayjs();
    const windowStart = now.add(minutesBefore, 'minute');
    const windowEnd = windowStart.add(REMINDER_WINDOW_MINUTES, 'minute');

    const interviews = await this.prisma.interviewRequest.findMany({
      where: {
        status: InterviewRequestStatus.ASSIGNED,
        currentSpot: {
          startAt: {
            gte: windowStart.toDate(),
            lt: windowEnd.toDate(),
          },
        },
      },
      include: {
        currentSpot: true,
        exam: {
          select: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    for (const interview of interviews) {
      const spot = interview.currentSpot;
      const user = interview.exam?.user;

      if (!spot || !user?.email || !user.fullName) continue;

      const reminderKey = `interview_reminder_${type}:${spot.id}`;
      const shouldSend = await this.redisService.setIfNotExists(reminderKey, 'sent');
      if (!shouldSend) continue;

      try {
        const dateLabel = this.formatInterviewDateLabel(spot.startAt);
        const timeLabel = this.formatInterviewTimeLabel(spot.startAt, spot.endAt);
        await this.emailService.sendInterviewReminderEmail(
          user.fullName,
          user.email,
          dateLabel,
          timeLabel,
          spot.meetUrl ?? undefined
        );
      } catch (error) {
        await this.redisService.deleteValue(reminderKey);
        this.logger.error(`Failed to send ${type} interview reminder`, error);
      }
    }
  }

  private formatInterviewDateLabel(date: Date): string {
    const day = dayjs(date);
    const weekday = VIETNAMESE_WEEKDAYS[day.day()] ?? '';
    return `${weekday}, ngày ${day.format('DD/MM/YYYY')}`;
  }

  private formatInterviewTimeLabel(startAt: Date, endAt: Date): string {
    return `${dayjs(startAt).format('HH:mm')} - ${dayjs(endAt).format('HH:mm')}`;
  }
}
