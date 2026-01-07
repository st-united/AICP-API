import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { GoogleCalendarService } from '@app/common/helpers/google-calendar.service';

@Injectable()
export class InterviewReminderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async sendInterviewReminders(): Promise<void> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      dayAfterTomorrow.setHours(0, 0, 0, 0);

      const upcomingInterviews = await this.prismaService.interviewRequest.findMany({
        where: {
          currentSpot: {
            startAt: {
              gte: tomorrow,
              lt: dayAfterTomorrow,
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

      for (const interview of upcomingInterviews) {
        try {
          const user = interview.exam.user;
          const mentor = interview.mentorBookings?.[0]?.mentor;
          const spot = interview.currentSpot;

          if (user && user.email && spot) {
            const mentorEmail = mentor?.user?.email ?? user.email;
            const eventInfo = await GoogleCalendarService.createInterviewEvent(user.email, mentorEmail, {
              startAt: spot.startAt,
              endAt: spot.endAt,
              timezone: spot.timezone,
              meetUrl: spot.meetUrl,
            });

            await this.emailService.sendInterviewReminderEmail(
              user.fullName || user.email,
              user.email,
              spot.startAt,
              this.getTimeSlotLabel(spot.startAt, spot.endAt),
              eventInfo.meetUrl
            );
          }
        } catch (error) {
          console.error(`Failed to send interview reminder for interview ${interview.id}:`, error);
        }
      }
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

  private getTimeSlotLabel(startAt: Date, endAt: Date): string {
    return `${this.formatTime(startAt)}-${this.formatTime(endAt)}`;
  }

  private formatTime(value: Date): string {
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
