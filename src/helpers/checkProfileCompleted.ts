import { ProfileDto } from '@UsersModule/dto/profile.dto';

export const calculateProfileCompleted = (user: Partial<ProfileDto>): boolean => {
  const phone = user.phoneNumber?.trim();
  const verified = user.zaloVerified === true;
  const hasJob = Array.isArray(user.job) && user.job.length > 0;

  if (!phone || !verified || !hasJob) return false;

  if (user.isStudent === true) return !!user.university && !!user.studentCode?.trim();

  return user.isStudent === false;
};
