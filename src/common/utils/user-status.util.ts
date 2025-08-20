import { ExamStatusText, UNKNOWN_EXAM_STATUS, UNKNOWN_USER_STATUS, UserStatusText } from '@Constant/user-status';
import { ExamStatus, UserTrackingStatus } from '@prisma/client';

export function getUserStatus(userStatus: UserTrackingStatus, examStatus?: ExamStatus): string {
  if (examStatus) {
    return ExamStatusText[examStatus] ?? UNKNOWN_EXAM_STATUS;
  }
  return UserStatusText[userStatus] ?? UNKNOWN_USER_STATUS;
}
