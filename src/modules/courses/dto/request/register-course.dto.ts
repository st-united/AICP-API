import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class RegisterCourseDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  learningPathId?: string;
}
