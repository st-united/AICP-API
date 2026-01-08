import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { GoogleCalendarService } from '@app/common/helpers/google-calendar.service';
import { InterviewRequestStatus, MentorBookingStatus } from '@prisma/client';
import { MentorSpotStatus } from '@Constant/index';

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
      const { start: startDate, end: endDate } = this.getTomorrowRange();

      const upcomingInterviews = await this.prismaService.interviewRequest.findMany({
        where: {
          status: {
            in: [InterviewRequestStatus.ASSIGNED, InterviewRequestStatus.RESCHEDULED],
          },
          currentSpot: {
            isNot: null,
            is: {
              startAt: { gte: startDate, lt: endDate },
              status: MentorSpotStatus.BOOKED,
            },
          },
        },
        include: {
          currentSpot: true,
          exam: {
            include: {
              user: true,
            },
          },
          mentorBookings: {
            include: {
              mentor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (upcomingInterviews.length === 0) {
        return { total: 0, sent: 0, skipped: 0, errors: 0, failedEmails: [] };
      }

      let sent = 0;
      let skipped = 0;
      let errors = 0;
      const failedEmails: ReminderFailure[] = [];

      for (const interview of upcomingInterviews) {
        const user = interview.exam.user;
        const mentor = interview.mentorBookings?.[0]?.mentor;
        const spot = interview.currentSpot;

        if (!user?.email || !spot) {
          skipped += 1;
          continue;
        }

        try {
          const mentorEmail = mentor?.user?.email ?? user.email;
          const eventInfo = await GoogleCalendarService.createInterviewEvent(user.email, mentorEmail, {
            startAt: spot.startAt,
            endAt: spot.endAt,
            timezone: spot.timezone,
            meetUrl: spot.meetUrl,
          });

          await this.emailService.sendInterviewReminderEmail(
            user.fullName,
            user.email,
            spot.startAt,
            this.getTimeSlotLabel(spot.startAt, spot.endAt),
            eventInfo.meetUrl
          );
          sent += 1;
        } catch (error) {
          errors += 1;
          failedEmails.push({
            email: user.email,
            bookingId: interview.mentorBookings?.[0]?.id ?? '',
            interviewId: interview.id,
            reason: this.getErrorMessage(error),
          });
          console.error(`Failed to send interview reminder for interview ${interview.id}:`, error);
        }
      }

      if (failedEmails.length > 0) {
        console.error('Failed interview reminder emails:', failedEmails);
      }

      return {
        total: upcomingInterviews.length,
        sent,
        skipped,
        errors,
        failedEmails,
      };
    } catch (error) {
      console.error('Error in sendInterviewReminders:', error);
      throw error;
    }
  }

  async getUpcomingInterviews(days: number = 1): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    const upcomingInterviews = await this.prismaService.interviewRequest.findMany({
      where: {
        currentSpot: {
          startAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      include: {
        currentSpot: true,
        exam: {
          include: {
            user: true,
          },
        },
        mentorBookings: {
          include: {
            mentor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return upcomingInterviews.map((interview) => {
      const spot = interview.currentSpot;
      return {
        ...interview,
        interviewDate: spot?.startAt,
        timeSlot: spot ? this.getTimeSlotLabel(spot.startAt, spot.endAt) : '',
        MentorBooking: interview.mentorBookings,
      };
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return String(error);
  }

  private getTimeSlotLabel(startAt: Date, endAt: Date): string {
    return `${this.formatTime(startAt)}-${this.formatTime(endAt)}`;
  }

  private formatTime(value: Date): string {
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
}
