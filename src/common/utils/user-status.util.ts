import { ExamStatusText, UserStatusText } from '@Constant/user-status';
import { ExamStatus, UserTrackingStatus } from '@prisma/client';

export function getUserStatus(userStatus: UserTrackingStatus, examStatus?: ExamStatus): string {
  if (examStatus) {
    return ExamStatusText[examStatus] ?? 'Unknown Exam Status';
  }
  return UserStatusText[userStatus] ?? 'Unknown User Status';
}
