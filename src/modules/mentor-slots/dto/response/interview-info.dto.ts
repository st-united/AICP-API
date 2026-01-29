import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class InterviewInfoDto {
  @Expose()
  @ApiProperty({ example: 'exam-uuid' })
  examId: string;

  @Expose()
  @ApiProperty({ example: 'Nguyen Van A' })
  userName: string;

  @Expose()
  @ApiProperty({ example: 'a@gmail.com' })
  userEmail: string;
}
