import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class AnswerDto {
  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  id?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  answer_text?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  manual_score?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  auto_score?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  question_id?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  user_id?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  answer_id?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  exam_set_id?: string;

  @Expose()
  @ApiProperty()
  @Transform(({ value }) => (value == null ? undefined : value))
  status?: string;
}
