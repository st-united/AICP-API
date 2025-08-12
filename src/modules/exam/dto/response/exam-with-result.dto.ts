import { ApiProperty } from '@nestjs/swagger';
import { QuestionWithUserAnswerDto } from './question-with-user-answer.dto';
import { CourseDto } from './course.dto';
import { DetailExamResponseDto } from './detail-exam-response.dto';

export class ExamWithResultDto {
  @ApiProperty()
  elapsedTime: string;

  @ApiProperty({ type: [QuestionWithUserAnswerDto] })
  questions: QuestionWithUserAnswerDto[];

  @ApiProperty({ example: 7, description: 'Tổng số câu trả lời đúng' })
  correctCount: number;

  @ApiProperty({ example: 2, description: 'Tổng số câu trả lời sai' })
  wrongCount: number;

  @ApiProperty({ example: 1, description: 'Tổng số câu bị bỏ qua' })
  skippedCount: number;

  @ApiProperty()
  level: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  learningPath: string;

  @ApiProperty({ type: [CourseDto] })
  recommendedCourses: CourseDto[];
}

export class UserWithExamsResponseDto {
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    position: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  exams: DetailExamResponseDto[];
}
