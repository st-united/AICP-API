import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class HasTakenExamDto {
  @Expose()
  @ApiProperty()
  @IsUUID()
  userId: string;

  @Expose()
  @ApiProperty()
  @IsUUID()
  examSetId: string;
}
