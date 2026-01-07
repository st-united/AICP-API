import { google, Auth } from 'googleapis';
import type { MentorTimeSpot } from '@prisma/client';

type CalendarEventInfo = {
  meetUrl: string;
  eventId: string | null;
};

export class GoogleCalendarService {
  private static async getCalendarClient() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID?.trim(),
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
      process.env.GOOGLE_CALLBACK_URL?.trim()
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to obtain access token');
    }

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      access_token: token,
    });

    return google.calendar({
      version: 'v3',
      auth: oauth2Client as Auth.OAuth2Client,
    });
  }

  static async createInterviewEvent(
    userEmail: string,
    mentorEmail: string,
    timeSpot: Pick<MentorTimeSpot, 'startAt' | 'endAt' | 'timezone' | 'meetUrl'>
  ): Promise<CalendarEventInfo> {
    const calendar = await this.getCalendarClient();

    const startDateTime = new Date(timeSpot.startAt);
    const endDateTime = new Date(timeSpot.endAt);

    if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
      throw new Error('Invalid time spot range');
    }

    if (endDateTime <= startDateTime) {
      throw new Error('Invalid time spot range');
    }

    const timeZone = timeSpot.timezone || 'Asia/Ho_Chi_Minh';
    const attendeeEmails = [userEmail, mentorEmail];
    const attendees = Array.from(new Set(attendeeEmails)).map((email) => ({ email }));

    const baseEvent = {
      summary: 'Phỏng vấn chính thức',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone,
      },
      attendees,
    };

    const event = timeSpot.meetUrl
      ? {
          ...baseEvent,
          location: timeSpot.meetUrl,
          description: `Meeting link: ${timeSpot.meetUrl}`,
        }
      : {
          ...baseEvent,
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
        sendUpdates: 'all',
        ...(timeSpot.meetUrl ? {} : { conferenceDataVersion: 1 }),
        requestBody: event,
      });

      return {
        meetUrl: timeSpot.meetUrl || response.data.hangoutLink || 'Link không khả dụng',
        eventId: response.data.id || null,
      };
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return {
        meetUrl: timeSpot.meetUrl || 'https://meet.google.com/default-link',
        eventId: null,
      };
    }
  }

  static async addAttendeesToEvent(
    eventId: string,
    attendeeEmails: string[],
    calendarId: string = 'primary'
  ): Promise<void> {
    if (!eventId) {
      throw new Error('eventId is required');
    }

    if (!attendeeEmails?.length) {
      return;
    }

    const calendar = await this.getCalendarClient();

    const existingEvent = await calendar.events.get({
      calendarId,
      eventId,
    });

    const existingEmails = (existingEvent.data.attendees || [])
      .map((attendee) => attendee.email)
      .filter((email): email is string => Boolean(email));

    const incomingEmails = attendeeEmails.filter((email): email is string => Boolean(email));
    const mergedEmails = Array.from(new Set([...existingEmails, ...incomingEmails]));

    if (!mergedEmails.length) {
      return;
    }

    if (mergedEmails.length === existingEmails.length) {
      return;
    }

    await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: 'all',
      requestBody: {
        attendees: mergedEmails.map((email) => ({ email })),
      },
    });
  }
}
