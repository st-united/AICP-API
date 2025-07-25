import { Expose } from 'class-transformer';
import { $Enums, Course } from '@prisma/client';

export class CourseResponseDto implements Partial<Course> {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  overview: string;

  @Expose()
  description: string;

  @Expose()
  courseInformation: string;

  @Expose()
  contactInformation: string;

  @Expose()
  applicableObjects: string;

  @Expose()
  provider: string;

  @Expose()
  url: string | null;

  @Expose()
  linkImage: string | null;

  @Expose()
  courseType: string | null;

  @Expose()
  durationHours: number | null;

  @Expose()
  difficultyLevel?: $Enums.SFIALevel | null;

  @Expose()
  aspectId?: string;

  @Expose()
  domainId?: string | null;

  @Expose()
  sfiaLevels: $Enums.SFIALevel[];

  @Expose()
  isActive?: boolean;
}
