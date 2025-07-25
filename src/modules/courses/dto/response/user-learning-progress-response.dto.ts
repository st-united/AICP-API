import { Expose, Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { UserLearningProgress } from '@prisma/client';

export class UserLearningProgressResponseDto implements Partial<UserLearningProgress> {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  courseId: string;

  @Expose()
  learningPathId?: string | null;

  @Expose()
  startedAt?: Date | null;

  @Expose()
  completedAt?: Date | null;

  @Expose()
  rating?: number | null;

  @Expose()
  feedback?: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
