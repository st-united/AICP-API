import { IsArray, IsUUID } from 'class-validator';

export class AssignMentorDto {
  @IsUUID()
  mentorId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  interviewRequestIds: string[];
}
