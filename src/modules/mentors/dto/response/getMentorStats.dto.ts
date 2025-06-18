import { Expose } from 'class-transformer';

export class MentorStatsDto {
  @Expose()
  totalMentors: number;

  @Expose()
  activeMentors: number;

  @Expose()
  inactiveMentors: number;
}
