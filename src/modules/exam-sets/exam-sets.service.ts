import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetExamSetDto } from './dto/get-exam-set.dto';
import { ResponseItem } from '@app/common/dtos';
import { ExamSetWithQuestions, UserExam, UserAnswer } from './interface/exam-sets.interface';
import { ExamStatus } from '@prisma/client';

@Injectable()
export class ExamSetsService {
  private static readonly EXAM_SET_NAME = 'AI For Fresher';
  private static readonly DEFAULT_EXAM_DURATION_MINUTES = 40;

  constructor(private readonly prisma: PrismaService) {}

  create(createExamSetDto: CreateExamSetDto) {
    return 'This action adds a new examSet';
  }

  findAll() {}

  findOne(id: string) {
    return `This action returns a #${id} examSet`;
  }

  update(id: string, updateExamSetDto: UpdateExamSetDto) {
    return `This action updates a #${id} examSet`;
  }

  remove(id: string) {
    return `This action removes a #${id} examSet`;
  }

  async getExamSetWithQuestions(userId: string, examSetName?: string): Promise<ResponseItem<GetExamSetDto>> {
    const examSet = await this.findExamSetWithQuestions(examSetName);
    if (!examSet) {
      throw new NotFoundException('Không tìm thấy bộ đề thi');
    }

    const allExams = await this.prisma.exam.findMany({
      where: {
        userId: userId,
        examSetId: examSet.id,
      },
      orderBy: { createdAt: 'asc' },
    });
    const attempts = allExams.length;
    const latestExam = allExams[attempts - 1];

    if (!latestExam || latestExam.examStatus === ExamStatus.SUBMITTED) {
      const response = await this.createNewExam(userId, examSet);
      return new ResponseItem(
        response.data,
        `Bài kiểm tra mới đã được tạo. Đây là lần làm thứ ${attempts + 1}`,
        GetExamSetDto
      );
    }

    if (latestExam.examStatus === ExamStatus.IN_PROGRESS) {
      return await this.handleInProgressExam(userId, latestExam, examSet);
    }

    throw new NotFoundException('Trạng thái bài kiểm tra không hợp lệ');
  }

  private async findExamSetWithQuestions(examSetName?: string): Promise<ExamSetWithQuestions | null> {
    return this.prisma.examSet.findFirst({
      where: { name: examSetName ?? ExamSetsService.EXAM_SET_NAME },
      include: {
        exam: true,
        setQuestion: {
          include: {
            question: {
              include: {
                answerOptions: true,
                skill: true,
                level: true,
              },
            },
          },
          orderBy: {
            question: {
              sequence: 'asc',
            },
          },
        },
      },
    });
  }

  private async findUserExam(userId: string, examSetId: string): Promise<UserExam | null> {
    return this.prisma.exam.findFirst({
      where: {
        userId: userId,
        examSetId: examSetId,
      },
    });
  }

  private async findUserAnswers(userId: string, examId: string): Promise<UserAnswer[]> {
    return this.prisma.userAnswer.findMany({
      where: {
        userId: userId,
        examId: examId,
      },
      include: {
        selections: true,
      },
    });
  }

  private determineExamStatus(exam: UserExam): ExamStatus {
    const now = new Date();
    if (exam.examStatus === 'IN_PROGRESS' && now < exam.finishedAt) {
      return 'IN_PROGRESS';
    }
    return 'SUBMITTED';
  }

  private async handleInProgressExam(
    userId: string,
    exam: UserExam,
    examSet: ExamSetWithQuestions
  ): Promise<ResponseItem<GetExamSetDto>> {
    const userAnswers = await this.findUserAnswers(userId, exam.id);
    const examSetData = this.buildExamSetData(examSet, userAnswers, exam);

    const message =
      exam.examStatus === 'IN_PROGRESS'
        ? 'Bài kiểm tra chưa hoàn thành, bạn có muốn tiếp tục?'
        : 'Thành công nhận bộ đề thi';

    return new ResponseItem(examSetData, message, GetExamSetDto);
  }

  private async createNewExam(userId: string, examSet: ExamSetWithQuestions): Promise<ResponseItem<GetExamSetDto>> {
    const examDuration = examSet.timeLimitMinutes ?? ExamSetsService.DEFAULT_EXAM_DURATION_MINUTES;
    const startedAt = new Date();
    const finishedAt = new Date(startedAt.getTime() + examDuration * 60 * 1000);

    const newExam = await this.prisma.exam.create({
      data: {
        userId,
        examSetId: examSet.id,
        startedAt,
        finishedAt,
        examStatus: 'IN_PROGRESS',
      },
    });

    const examSetData = this.buildExamSetData(examSet, [], newExam);
    return new ResponseItem(examSetData, 'Bài kiểm tra mới đã được tạo', GetExamSetDto);
  }

  private buildExamSetData(examSet: ExamSetWithQuestions, userAnswers: UserAnswer[], exam: UserExam): GetExamSetDto {
    return {
      id: examSet.id,
      examId: exam.id,
      timeStart: exam.startedAt,
      name: examSet.name,
      description: examSet.description ?? null,
      timeLimitMinutes: examSet.timeLimitMinutes,
      questions: examSet.setQuestion.map((qSet: any) => {
        const q = qSet.question;
        const userAnswer = userAnswers.find((ans) => ans.questionId === q.id);

        return {
          id: q.id,
          type: q.type,
          content: q.content,
          subcontent: q.subcontent ?? null,
          image: q.image ?? null,
          sequence: q.sequence ?? null,
          answerOptions: q.answerOptions.map((a: any) => ({
            id: a.id,
            content: a.content,
            isCorrect: a.isCorrect,
            explanation: a.explanation ?? null,
            selected: userAnswer ? userAnswer.selections.some((sel: any) => sel.answerOptionId === a.id) : false,
          })),
          userAnswerText: userAnswer?.answerText ?? null,
        };
      }),
    };
  }
}
