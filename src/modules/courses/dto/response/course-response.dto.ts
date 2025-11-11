import { Expose } from 'class-transformer';

export class CourseResponseDto {
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
  isRegistered: boolean;

  @Expose()
  isActive?: boolean;
}
