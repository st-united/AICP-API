import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsArray, IsString } from 'class-validator';
import { AnswerItem } from './answer-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class userAnswerDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'exam-set-123',
    description: 'ID of the exam/test set',
  })
  examSetId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'question-456',
    description: 'ID of the question being answered',
  })
  questionId: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItem)
  @ApiProperty({
    type: [AnswerItem],
    example: [
      {
        answerId: 'answer-1',
      },
    ],
    description: 'List of answers. For writing questions, use "answer"; for others, use "answerId".',
  })
  answers: AnswerItem[];

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'MULTIPLE_CHOICE',
    description: 'Type of the question (e.g. "MULTIPLE_CHOICE", "SINGLE_CHOICE", "TRUE_FALSE", "ESSAY")',
  })
  type: string;
}
