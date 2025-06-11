import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamSetDto } from './dto/create-exam-set.dto';
import { UpdateExamSetDto } from './dto/update-exam-set.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetExamSetDto } from './dto/get-exam-set.dto';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class ExamSetsService {
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

  async getExamSetWithQuestions(userId: string): Promise<ResponseItem<GetExamSetDto>> {
    const examSet = await this.findExamSetWithQuestions();
    if (!examSet) {
      throw new NotFoundException('Không tìm thấy bộ đề thi');
    }

    const [existingExam, userAnswers] = await Promise.all([
      this.findUserExam(userId, examSet.id),
      this.findUserAnswers(userId, examSet.id),
    ]);

    const now = new Date();

    if (existingExam && existingExam.startedAt <= now && existingExam.finishedAt > now) {
      const examSetData = this.buildExamSetData(examSet, userAnswers);
      return new ResponseItem(examSetData, 'Bài kiểm tra chưa hoàn thành, bạn có muốn tiếp tục?', GetExamSetDto);
    } else if (existingExam && now > existingExam.finishedAt) {
      return new ResponseItem(null, 'Bạn đã làm bài AI INPUT TEST, không thể làm lại.', GetExamSetDto);
    }

    await this.createNewExam(userId, examSet.id);

    const examSetData = await this.buildExamSetData(examSet, userAnswers);
    return new ResponseItem(examSetData, 'Thành công nhận bộ đề thi', GetExamSetDto);
  }

  private async findExamSetWithQuestions() {
    const EXAM_SET_NAME = 'AI INPUT TEST';
    return this.prisma.examSet.findFirst({
      where: { name: EXAM_SET_NAME },
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

  private async findUserExam(userId: string, examSetId: string) {
    return this.prisma.exam.findFirst({
      where: {
        userId: userId,
        examSetId: examSetId,
      },
    });
  }

  private async findUserAnswers(userId: string, examId: string) {
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

  private async createNewExam(userId: string, examSetId: string, duration?: number) {
    const examDuration = duration ?? 40;
    const startedAt = new Date();
    const finishedAt = new Date(startedAt.getTime() + examDuration * 60 * 1000);

    const newExam = await this.prisma.exam.create({
      data: {
        userId,
        examSetId,
        startedAt,
        finishedAt,
      },
    });

    return newExam;
  }

  private buildExamSetData(examSet: any, userAnswers: any[]) {
    return {
      id: examSet.id,
      name: examSet.name,
      description: examSet.description,
      duration: examSet.duration,
      questions: examSet.questions.map((qSet: any) => {
        const q = qSet.question;
        const userAnswer = userAnswers.find((ans) => ans.questionId === q.id);

        return {
          id: q.id,
          type: q.type,
          content: q.content,
          subcontent: q.subcontent,
          image: q.image,
          sequence: q.sequence,
          answerOptions: q.answerOptions.map((a: any) => ({
            id: a.id,
            content: a.content,
            isCorrect: a.isCorrect,
            selected: userAnswer ? userAnswer.selections.some((sel: any) => sel.answerOptionId === a.id) : false,
          })),
          userAnswerText: userAnswer?.answerText ?? null,
        };
      }),
    };
  }
}
