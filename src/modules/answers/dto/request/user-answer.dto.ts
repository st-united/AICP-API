import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsArray, IsString } from 'class-validator';
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
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    example: ['answer-1', 'answer-2'],
    description: 'List of answer IDs.',
  })
  answers: string[];

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'MULTIPLE_CHOICE',
    description: 'Type of the question (e.g. "MULTIPLE_CHOICE", "SINGLE_CHOICE", "TRUE_FALSE", "ESSAY")',
  })
  type: string;
}
