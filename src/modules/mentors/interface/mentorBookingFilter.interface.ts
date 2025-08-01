import { MentorBookingStatus } from '@prisma/client';

export interface MentorBookingFilter {
  mentorId: string;
  status?: MentorBookingStatus;
  level?: string;
  dateStart?: Date;
  dateEnd?: Date;
  keyword?: string;
}
