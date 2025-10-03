import { Controller, Get, Post, Query } from '@nestjs/common';
import { InterviewReminderService } from './interview-reminder.service';
import {
  InterviewReminderResponse,
  UpcomingInterviewsResponse,
  InterviewReminderDto,
} from './dto/interview-reminder.dto';

@Controller('interview-reminder')
export class InterviewReminderController {
  constructor(private readonly interviewReminderService: InterviewReminderService) {}

  @Post('send-reminders')
  async sendInterviewReminders(): Promise<InterviewReminderResponse> {
    try {
      await this.interviewReminderService.sendInterviewReminders();

      const upcomingInterviews = await this.interviewReminderService.getUpcomingInterviews(1);
      const mappedInterviews: InterviewReminderDto[] = upcomingInterviews.map((interview) => ({
        id: interview.id,
        examId: interview.examId,
        interviewDate: interview.interviewDate,
        timeSlot: interview.timeSlot,
        user: {
          id: interview.exam.user.id,
          email: interview.exam.user.email,
          fullName: interview.exam.user.fullName,
        },
        mentor: interview.MentorBooking?.[0]?.mentor?.user
          ? {
              id: interview.MentorBooking[0].mentor.user.id,
              fullName: interview.MentorBooking[0].mentor.user.fullName,
            }
          : undefined,
      }));

      return {
        message: 'Interview reminders sent successfully',
        totalSent: mappedInterviews.length,
        interviews: mappedInterviews,
      };
    } catch (error) {
      return {
        message: 'Failed to send interview reminders',
        totalSent: 0,
        interviews: [],
      };
    }
  }

  @Get('upcoming-interviews')
  async getUpcomingInterviews(@Query('days') days?: string): Promise<UpcomingInterviewsResponse> {
    try {
      const daysAhead = days ? parseInt(days, 10) : 1;
      const upcomingInterviews = await this.interviewReminderService.getUpcomingInterviews(daysAhead);

      const mappedInterviews: InterviewReminderDto[] = upcomingInterviews.map((interview) => ({
        id: interview.id,
        examId: interview.examId,
        interviewDate: interview.interviewDate,
        timeSlot: interview.timeSlot,
        user: {
          id: interview.exam.user.id,
          email: interview.exam.user.email,
          fullName: interview.exam.user.fullName,
        },
        mentor: interview.MentorBooking?.[0]?.mentor?.user
          ? {
              id: interview.MentorBooking[0].mentor.user.id,
              fullName: interview.MentorBooking[0].mentor.user.fullName,
            }
          : undefined,
      }));

      return {
        message: `Found upcoming interviews for next ${daysAhead} day(s)`,
        totalFound: mappedInterviews.length,
        interviews: mappedInterviews,
      };
    } catch (error) {
      return {
        message: 'Failed to get upcoming interviews',
        totalFound: 0,
        interviews: [],
      };
    }
  }

  @Get('test-tomorrow')
  async testTomorrowInterviews(): Promise<UpcomingInterviewsResponse> {
    return this.getUpcomingInterviews('1');
  }
}
