import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerItem {
  @IsString()
  @ApiProperty()
  answer: string;

  @IsString()
  @ApiProperty()
  answerId: string;
}
