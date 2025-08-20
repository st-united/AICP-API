import { ExamStatus, UserTrackingStatus } from '@prisma/client';

export const ExamStatusText: Record<ExamStatus, string> = {
  [ExamStatus.IN_PROGRESS]: 'In Progress',
  [ExamStatus.SUBMITTED]: 'Submitted',
  [ExamStatus.WAITING_FOR_REVIEW]: 'Waiting for Review',
  [ExamStatus.GRADED]: 'Graded',
  [ExamStatus.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
  [ExamStatus.INTERVIEW_COMPLETED]: 'Interview Completed',
  [ExamStatus.RESULT_EVALUATED]: 'Result Evaluated',
};

export const UserStatusText: Record<UserTrackingStatus, string> = {
  [UserTrackingStatus.REGISTERED]: 'Registered',
  [UserTrackingStatus.ACTIVATED]: 'Activated',
  [UserTrackingStatus.PROFILE_PENDING]: 'Profile Pending',
  [UserTrackingStatus.PROFILE_COMPLETED]: 'Profile Completed',
};
