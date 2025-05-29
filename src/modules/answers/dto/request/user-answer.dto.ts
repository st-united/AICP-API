import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsString, IsArray } from 'class-validator';
import { AnswerItem } from './answer-item.dto';
import { ApiProperty } from '@nestjs/swagger';
export class userAnswerDto {
  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  examSetId: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  questionId: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItem)
  @ApiProperty()
  answers: AnswerItem[];

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  type: string;
}
