import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HasTakenExamDto } from './dto/request/has-taken-exam.dto';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ResponseItem } from '@app/common/dtos';
import { Exam, ExamSet } from '@prisma/client';
import { examSetDefaultName } from '@Constant/enums';

@Injectable()
export class ExamService {
  private readonly logger = new Logger(ExamService.name);

  constructor(private readonly prisma: PrismaService) {}

  private createExamResponse(examSet: ExamSet, exam: Exam, hasTaken: boolean): ResponseItem<HasTakenExamResponseDto> {
    const response: HasTakenExamResponseDto = {
      hasTakenExam: hasTaken,
      examSetDuration: examSet.duration,
      examId: exam?.id,
    };
    return new ResponseItem(response, hasTaken ? 'Đã làm bài thi này' : 'Chưa làm bài thi này');
  }

  private async findExamSet(where: any) {
    try {
      const examSet = await this.prisma.examSet.findFirst({
        where: {
          ...(where.id && { id: where.id }),
          ...(where.name && { name: where.name }),
        },
        include: {
          exams: {
            where: { userId: where.userId },
            take: 1,
          },
        },
      });

      if (!examSet) {
        throw new NotFoundException('Bộ đề không tồn tại');
      }

      return examSet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);

      throw new BadRequestException('Lỗi khi kiểm tra bài thi đã được làm chưa');
    }
  }

  async hasTakenExam(params: HasTakenExamDto): Promise<ResponseItem<HasTakenExamResponseDto>> {
    const examSet = await this.findExamSet({ id: params.examSetId, userId: params.userId });
    const exam = examSet.exams[0];
    return this.createExamResponse(examSet, exam, !!exam);
  }

  async hasTakenExamInputTest(userId: string): Promise<ResponseItem<HasTakenExamResponseDto>> {
    const examSet = await this.findExamSet({
      name: examSetDefaultName.DEFAULT,
      userId,
    });
    const exam = examSet.exams[0];
    return this.createExamResponse(examSet, exam, !!exam);
  }
}
