import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HasTakenExamDto } from './dto/request/has-taken-exam.dto';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async hasTakenExam(queries: HasTakenExamDto): Promise<ResponseItem<HasTakenExamResponseDto>> {
    const exam = await this.prisma.exam.findFirst({
      where: {
        userId: queries.userId,
        examSetId: queries.examSetId,
      },
      include: {
        examSet: true,
      },
    });

    if (!exam) {
      const examSet = await this.prisma.examSet.findFirst({
        where: {
          id: queries.examSetId,
        },
      });

      if (!examSet) {
        throw new NotFoundException('Bộ đề không tồn tại');
      }

      const hasNotTakenExam: HasTakenExamResponseDto = {
        hasTakenExam: false,
        examSetDuration: examSet.duration,
      };
      return new ResponseItem(hasNotTakenExam, 'Chưa làm bài thi này');
    }

    const hasTakenExam: HasTakenExamResponseDto = {
      hasTakenExam: true,
      examSetDuration: exam.examSet.duration,
      examId: exam.id,
    };

    return new ResponseItem(hasTakenExam, 'Đã làm bài thi này');
  }
}
