import { Expose, Type } from 'class-transformer';

export class AnswerOptionDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  isCorrect: boolean;

  @Expose()
  explanation?: string;

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
  examId: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  timeLimitMinutes: number;

  @Expose()
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
