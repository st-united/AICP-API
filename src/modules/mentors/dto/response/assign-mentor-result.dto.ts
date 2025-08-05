export class AssignMentorResultDto {
  bookings: {
    id: string;
    interviewRequestId: string;
    mentorId: string;
    status: string;
    createdAt: Date;
  }[];
}
