import { IsArray, IsUUID } from 'class-validator';

export class AssignMentorDto {
  @IsArray()
  @IsUUID('all', { each: true })
  interviewRequestIds: string[];
}
