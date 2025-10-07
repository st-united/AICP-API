import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { GoogleCalendarService } from '@app/helpers/google-calendar.service';

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
          interviewDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
        },
        include: {
          exam: {
            include: {
              user: true,
            },
          },
          MentorBooking: {
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
          const mentor = interview.MentorBooking?.[0]?.mentor;

          if (user && user.email) {
            const meetLink = await GoogleCalendarService.createInterviewEvent(
              user.email,
              mentor?.user?.email,
              interview.interviewDate,
              interview.timeSlot
            );

            await this.emailService.sendInterviewReminderEmail(
              user.fullName || user.email,
              user.email,
              interview.interviewDate,
              interview.timeSlot,
              meetLink
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

    return this.prismaService.interviewRequest.findMany({
      where: {
        interviewDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        exam: {
          include: {
            user: true,
          },
        },
        MentorBooking: {
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
  }
}
