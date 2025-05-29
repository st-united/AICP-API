import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HasTakenExamDto } from './dto/request/has-taken-exam.dto';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async hasTakenExam(params: HasTakenExamDto): Promise<ResponseItem<HasTakenExamResponseDto>> {
    const examSet = await this.prisma.examSet.findFirst({
      where: { id: params.examSetId },
      include: {
        exams: {
          where: { userId: params.userId },
          take: 1,
        },
      },
    });

    if (!examSet) {
      throw new NotFoundException('Bộ đề không tồn tại');
    }

    const exam = examSet.exams[0];

    if (!exam) {
      const hasNotTakenExam: HasTakenExamResponseDto = {
        hasTakenExam: false,
        examSetDuration: examSet.duration,
      };
      return new ResponseItem(hasNotTakenExam, 'Chưa làm bài thi này');
    }

    const hasTakenExam: HasTakenExamResponseDto = {
      hasTakenExam: true,
      examSetDuration: examSet.duration,
      examId: exam.id,
    };

    return new ResponseItem(hasTakenExam, 'Đã làm bài thi này');
  }
}
