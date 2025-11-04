import { ProfileDto } from '@UsersModule/dto/profile.dto';

export function calculateProfileCompleted(user: Partial<ProfileDto>): boolean {
  const phone = (user.phoneNumber || '').trim();
  if (!phone) return false;

  // zaloVerified required
  if (!user.zaloVerified) return false;

  const hasJob = Array.isArray(user.job) && user.job.length > 0;

  if (user.isStudent === true) {
    const hasUniversity = !!user.university;
    const hasStudentCode = !!(user.studentCode || '').trim();
    return hasJob && hasUniversity && hasStudentCode;
  }

  if (user.isStudent === false) {
    return hasJob;
  }

  return false;
}
