import { ApiProperty } from '@nestjs/swagger';
import { AnswerOptionDto } from './answer-option.dto';

export class QuestionWithUserAnswerDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  question: string;

  @ApiProperty({ type: [AnswerOptionDto] })
  answers: AnswerOptionDto[];

  @ApiProperty({ type: [String] })
  userAnswers: string[];
}
