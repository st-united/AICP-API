import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { EmailService } from '@app/modules/email/email.service';
import { InterviewRequestStatus, MentorBookingStatus } from '@prisma/client';
import {
  ReminderRunResult,
  ReminderFailure,
} from '@app/modules/interview-reminder/interface/interview-reminder.interface';

@Injectable()
export class InterviewReminderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async sendInterviewReminders(): Promise<ReminderRunResult> {
    try {
      const { start: tomorrow, end: dayAfterTomorrow } = this.getTomorrowRange();

      const upcomingBookings = await this.prismaService.mentorBooking.findMany({
        where: {
          status: MentorBookingStatus.UPCOMING,
          interviewRequest: {
            is: {
              interviewDate: {
                gte: tomorrow,
                lt: dayAfterTomorrow,
              },
              status: InterviewRequestStatus.ASSIGNED,
            },
          },
        },
        select: {
          id: true,
          interviewRequest: {
            select: {
              id: true,
              interviewDate: true,
              timeSlot: true,
              exam: {
                select: {
                  user: {
                    select: {
                      email: true,
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (upcomingBookings.length === 0) {
        return { total: 0, sent: 0, skipped: 0, errors: 0, failedEmails: [] };
      }

      let sent = 0;
      let skipped = 0;
      let errors = 0;
      const failedEmails: ReminderFailure[] = [];

      for (const booking of upcomingBookings) {
        const interview = booking.interviewRequest;
        const user = interview?.exam.user;

        if (!interview || !user?.email) {
          skipped += 1;
          continue;
        }

        try {
          await this.emailService.sendInterviewReminderEmail(
            user.fullName || user.email,
            user.email,
            interview.interviewDate,
            interview.timeSlot,
            'https://www.youtube.com/watch?v=zeBkb1HwiBc&list=RDjZVcd4uT-2I&index=15'
          );
          sent += 1;
        } catch (error) {
          errors += 1;
          failedEmails.push({
            email: user.email,
            bookingId: booking.id,
            interviewId: interview.id,
            reason: this.getErrorMessage(error),
          });
          console.error(
            `Failed to send interview reminder for booking ${booking.id} (interview ${interview.id}):`,
            error
          );
        }
      }
      if (failedEmails.length > 0) {
        console.error('Failed interview reminder emails:', failedEmails);
      }
      return { total: upcomingBookings.length, sent, skipped, errors, failedEmails };
    } catch (error) {
      console.error('Error in sendInterviewReminders:', error);
      throw error;
    }
  }

  private getTomorrowRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);

    return { start, end };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return String(error);
  }
}
