// dto/assign-mentor-result.dto.ts
export class AssignMentorResultDto {
  created: number;
  skipped: number;
  bookings: {
    id: string;
    interviewRequestId: string;
    mentorId: string;
    status: string;
    createdAt: Date;
  }[];
}
