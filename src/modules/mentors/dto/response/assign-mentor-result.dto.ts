export type BookingItem = {
  id: string;
  interviewRequestId: string;
  mentorId: string;
  status: string;
  createdAt: Date;
};

export class AssignMentorResultDto {
  bookings: BookingItem[];
}
