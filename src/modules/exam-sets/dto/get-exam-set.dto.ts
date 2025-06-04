import { Expose, Type } from 'class-transformer';

export class AnswerOptionDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  isCorrect: boolean;

  @Expose()
  selected?: boolean;
}

export class QuestionDto {
  @Expose()
  id: string;

  @Expose()
  type: string;

  @Expose()
  content: string;

  @Expose()
  subcontent?: string;

  @Expose()
  image?: string;

  @Expose()
  sequence?: number;

  @Expose()
  @Type(() => AnswerOptionDto)
  answerOptions: AnswerOptionDto[];

  @Expose()
  userAnswerText?: string;
}

export class GetExamSetDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  duration: number;

  @Expose()
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
