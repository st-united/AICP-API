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
}

export class MentorBookingResponseDto {
  @Expose()
  id: string;

  @Expose()
  mentorId: string;

  @Expose()
  userId: string;

  @Expose()
  timeSlot: string;

  @Expose()
  scheduledAt: Date;

  @Expose()
  status: string;

  @Expose()
  notes: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => `AICP${new Date(obj.scheduledAt).getTime()}`)
  codeOrder: string;

  @Expose()
  @Type(() => MentorDto)
  mentor: MentorDto;
}
