import { ApiProperty } from '@nestjs/swagger';
import { QuestionWithUserAnswerDto } from './question-with-user-answer.dto';

export class ExamWithResultDto {
  @ApiProperty()
  elapsedTime: string;

  @ApiProperty({ type: [QuestionWithUserAnswerDto] })
  questions: QuestionWithUserAnswerDto[];
}
