export interface InterviewReminderDto {
  id: string;
  examId: string;
  interviewDate: Date;
  timeSlot: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  mentor?: {
    id: string;
    fullName: string;
  };
}

export interface InterviewReminderResponse {
  message: string;
  totalSent: number;
  interviews: InterviewReminderDto[];
}

export interface UpcomingInterviewsResponse {
  message: string;
  totalFound: number;
  interviews: InterviewReminderDto[];
}
