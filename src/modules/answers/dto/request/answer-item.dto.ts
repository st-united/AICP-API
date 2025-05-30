import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AtLeastOneDefined } from './at-least-one-defined.validator';

export class AnswerItem {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'This is my written answer.',
    required: false,
    description: 'User’s written answer for writing-type questions',
  })
  answer?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'answer-123',
    required: false,
    description: 'Selected answer ID for choice-type questions',
  })
  answerId?: string;

  @AtLeastOneDefined({
    message: 'At least one of "answer" or "answerId" must be provided.',
  })
  dummyValidatorTrigger: string; // this is only used for validation triggering
}
