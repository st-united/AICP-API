import { ApiProperty } from '@nestjs/swagger';

export class AnswerOptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  isCorrect: boolean;
}
