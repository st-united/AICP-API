import { Expose, Transform, Type } from 'class-transformer';

export class MentorDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  specialization?: string;

  @Expose()
  experience?: number;

  @Expose()
  totalBookingsCompleted?: number;

  @Expose()
  isActive: boolean;
}

export class MentorBookingResponseDto {
  @Expose()
  id: string;

  @Expose()
  examId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
