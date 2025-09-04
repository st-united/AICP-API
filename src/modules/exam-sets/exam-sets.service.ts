import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetExamSetDto } from './dto/get-exam-set.dto';
import { ResponseItem } from '@app/common/dtos';
import { ExamSetWithQuestions, UserExam, UserAnswer } from './interface/exam-sets.interface';
import { ExamStatus } from '@prisma/client';
import { Order } from '@Constant/enums';

@Injectable()
export class ExamSetsService {
  private static readonly EXAM_SET_NAME = 'AI For Fresher';
  private static readonly DEFAULT_EXAM_DURATION_MINUTES = 40;

  constructor(private readonly prisma: PrismaService) {}

  create(createExamSetDto: CreateExamSetDto) {
    return 'This action adds a new examSet';
  }

  async findAll() {
    return this.prisma.examSet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        urlImage: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

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
    const FINAL_STATUSES: ExamStatus[] = [
      ExamStatus.WAITING_FOR_REVIEW,
      ExamStatus.GRADED,
      ExamStatus.INTERVIEW_SCHEDULED,
      ExamStatus.INTERVIEW_COMPLETED,
      ExamStatus.RESULT_EVALUATED,
    ];

    const allExams = await this.prisma.exam.findMany({
      where: {
        userId: userId,
        examSetId: examSet.id,
      },
      orderBy: { createdAt: Order.DESC },
    });
    const attempts = allExams.length;
    const finishedAttempts = allExams.filter((exam) => FINAL_STATUSES.includes(exam.examStatus)).length;
    const latestExam = allExams[0];

    if (finishedAttempts >= 3) {
      throw new ConflictException(`Bạn đã hoàn thành số lần làm tối đa (${finishedAttempts}/3) cho bộ đề này`);
    }

    if (latestExam && latestExam.examStatus === ExamStatus.IN_PROGRESS) {
      return await this.handleInProgressExam(userId, latestExam, examSet);
    }

    const forbiddenStatuses: ExamStatus[] = [
      ExamStatus.WAITING_FOR_REVIEW,
      ExamStatus.GRADED,
      ExamStatus.INTERVIEW_SCHEDULED,
      ExamStatus.INTERVIEW_COMPLETED,
      ExamStatus.RESULT_EVALUATED,
    ];

    const hasForbiddenExam = allExams.some((exam) => forbiddenStatuses.includes(exam.examStatus));
    if (hasForbiddenExam) {
      throw new ConflictException(
        'Bạn không thể  làm bài vì một trong các bài thi cho bộ đề này đang trong quá quy trình phỏng vấn'
      );
    }

    const response = await this.createNewExam(userId, examSet);
    return new ResponseItem(
      response.data,
      `Bài kiểm tra mới đã được tạo. Đây là lần làm thứ ${attempts + 1}`,
      GetExamSetDto
    );
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
    if (exam.examStatus === ExamStatus.IN_PROGRESS && now < exam.finishedAt) {
      return ExamStatus.IN_PROGRESS;
    }
    return ExamStatus.SUBMITTED;
  }

  private async handleInProgressExam(
    userId: string,
    exam: UserExam,
    examSet: ExamSetWithQuestions
  ): Promise<ResponseItem<GetExamSetDto>> {
    const userAnswers = await this.findUserAnswers(userId, exam.id);
    const examSetData = this.buildExamSetData(examSet, userAnswers, exam);

    const message =
      exam.examStatus === ExamStatus.IN_PROGRESS
        ? 'Bài kiểm tra chưa hoàn thành, bạn có muốn tiếp tục?'
        : 'Thành công nhận bộ đề thi';

    return new ResponseItem(examSetData, message, GetExamSetDto);
  }

  private async createNewExam(userId: string, examSet: ExamSetWithQuestions): Promise<ResponseItem<GetExamSetDto>> {
    const newExam = await this.prisma.exam.create({
      data: {
        userId,
        examSetId: examSet.id,
        examStatus: ExamStatus.IN_PROGRESS,
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
