import { Expose } from 'class-transformer';

export class UserLearningProgressResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  courseId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
