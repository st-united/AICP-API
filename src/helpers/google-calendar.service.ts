import { google, Auth } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { timeSlotEnum } from '@Constant/enums';

export class GoogleCalendarService {
  static async createInterviewEvent(
    userEmail: string,
    mentorEmail: string,
    interviewDate: Date,
    timeSlot: keyof typeof timeSlotEnum
  ): Promise<string> {
    const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to obtain access token');
    }

    const calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client as Auth.OAuth2Client,
    });

    const formattedTimeSlot = timeSlotEnum[timeSlot];
    const [startHour, endHour] = formattedTimeSlot.split('-').map((h) => h.trim());
    const startDateTime = new Date(interviewDate);
    startDateTime.setHours(parseInt(startHour.split(':')[0]), 0, 0, 0);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(parseInt(endHour.split(':')[0]), 0, 0, 0);

    const event = {
      summary: 'Phỏng vấn chính thức',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      attendees: [{ email: userEmail }, { email: mentorEmail }],
      conferenceData: {
        createRequest: {
          requestId: `req-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'none',
        requestBody: event,
      });

      return response.data.hangoutLink || 'Link không khả dụng';
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return 'https://meet.google.com/default-link';
    }
  }
}
