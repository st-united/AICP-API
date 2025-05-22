import { Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class MenteesByMentorIdDto {
  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  scheduledAt: Date;
}
