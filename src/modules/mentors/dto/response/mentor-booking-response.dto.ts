import { Expose } from 'class-transformer';

export class MentorBookingResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  interviewDate: Date;

  @Expose()
  nameExamSet: string;

  @Expose()
  level: string;

  @Expose()
  status: string;

  @Expose()
  stats: {
    total: number;
    past: number;
    upcoming: number;
    absent: number;
  };
}
