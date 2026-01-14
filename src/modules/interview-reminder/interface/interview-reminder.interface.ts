export interface ReminderFailure {
  email: string;
  bookingId: string;
  interviewId: string;
  reason: string;
}

export interface ReminderRunResult {
  total: number;
  sent: number;
  skipped: number;
  errors: number;
  failedEmails: ReminderFailure[];
}
