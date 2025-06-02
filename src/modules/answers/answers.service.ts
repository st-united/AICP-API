import { BadRequestException, Injectable } from '@nestjs/common';
import { userAnswerDto } from './dto/request/user-answer.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { UserAnswerStatus } from '@prisma/client';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class AnswersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}
  async create(userId, params: userAnswerDto): Promise<ResponseItem<userAnswerDto>> {
    try {
      if (!params.answers || params.answers.length === 0) {
        throw new Error('Không có câu trả lời nào được cung cấp');
      }
      if (params.type === 'ESSAY') {
        await this.handleEssayAnswer(userId, params);
      } else {
        await this.handleSelectionAnswers(userId, params);
      }

      return new ResponseItem(null, 'Lưu câu trả lời thành công');
    } catch (error) {
      throw new Error('Không tạo được câu trả lời');
    }
  }

  async update(userId: string, examSetId: string): Promise<ResponseItem<userAnswerDto>> {
    const existingExam = await this.prisma.exam.findFirst({
      where: {
        userId,
        examSetId,
      },
    });

    if (existingExam) {
      throw new BadRequestException('Bài kiểm tra này đã được nộp trước đó.');
    }
    try {
      await this.prisma.userAnswer.updateMany({
        where: { userId, examSetId },
        data: { status: UserAnswerStatus.SUBMIT },
      });

      const existingAnswers = await this.prisma.userAnswer.findMany({
        where: { userId, examSetId, status: UserAnswerStatus.SUBMIT },
        select: { id: true, questionId: true },
      });

      const userAnswerIds = existingAnswers.map((a) => a.id);
      const questionIds = existingAnswers.map((a) => a.questionId);

      const matchingSelections = await this.prisma.userAnswerSelection.findMany({
        where: { userAnswerId: { in: userAnswerIds } },
        include: { userAnswer: { select: { id: true, questionId: true } } },
      });

      const answerOptions = await this.prisma.answerOption.findMany({
        where: { questionId: { in: questionIds }, isCorrect: true },
        select: { id: true, content: true, isCorrect: true, questionId: true },
      });

      const groupedSelections = matchingSelections.reduce(
        (acc, curr) => {
          const { userAnswerId, answerOptionId, userAnswer } = curr;
          const questionId = userAnswer?.questionId;

          if (!acc[userAnswerId]) {
            acc[userAnswerId] = { userAnswerId, questionId, answerOptionIds: [] };
          }
          acc[userAnswerId].answerOptionIds.push(answerOptionId);
          return acc;
        },
        {} as Record<string, { userAnswerId: string; questionId: string; answerOptionIds: string[] }>
      );

      const groupedByQuestion = answerOptions.reduce(
        (acc, curr) => {
          const { questionId, id, content, isCorrect } = curr;
          if (!acc[questionId]) {
            acc[questionId] = { questionId, options: [] };
          }
          acc[questionId].options.push({ id, content, isCorrect });
          return acc;
        },
        {} as Record<string, { questionId: string; options: { id: string; content: string; isCorrect: boolean }[] }>
      );

      const scores = await Promise.all(
        Object.entries(groupedSelections).map(async ([userAnswerId, { questionId, answerOptionIds }]) => {
          const questionData = groupedByQuestion[questionId];
          if (!questionData) return [userAnswerId, 0];

          const correctOptionIds = questionData.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);

          const totalCorrect = correctOptionIds.length;

          const matchedCorrect = answerOptionIds.filter((id) => correctOptionIds.includes(id)).length;

          const rawScore = matchedCorrect / totalCorrect;

          const score = parseFloat(rawScore.toFixed(2));

          const userAnswer = await this.prisma.userAnswer.findFirst({
            where: {
              userId: userAnswerId,
              examSetId: examSetId,
            },
          });

          if (userAnswer) {
            await this.prisma.userAnswer.update({
              where: { id: userAnswer.id },
              data: { autoScore: score },
            });
          }

          return [userAnswerId, score];
        })
      );

      const totalScore = scores.reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : Number(val)), 0);

      const exam = await this.prisma.exam.findFirst({
        where: {
          userId,
          examSetId,
        },
      });

      await this.prisma.exam.update({
        where: { id: exam.id },
        data: {
          userId,
          examSetId,
          totalScore,
        },
      });

      return new ResponseItem(null, 'Đã nộp bài thành công');
    } catch (error) {
      throw new Error('Không cập nhật được câu trả lời và tính điểm');
    }
  }

  private async handleEssayAnswer(userId, params: userAnswerDto) {
    const [essayAnswer] = params.answers;
    const { answers, type, ...restParams } = params;

    const existingAnswers = await this.prisma.userAnswer.findMany({
      where: { userId, ...restParams },
      select: { id: true },
    });

    const existingIds = existingAnswers.map((a) => a.id);
    if (existingIds.length > 0) {
      await this.prisma.userAnswer.deleteMany({
        where: { id: { in: existingIds } },
      });
    }

    await this.prisma.userAnswer.create({
      data: {
        answerText: essayAnswer[0],
        ...restParams,
        userId,
      },
    });
  }

  private async handleSelectionAnswers(userId, params: userAnswerDto) {
    const { answers, type, ...restParams } = params;

    const existingAnswers = await this.prisma.userAnswer.findMany({
      where: {
        ...restParams,
        userId,
      },
      select: { id: true },
    });

    const existingIds = existingAnswers.map((a) => a.id);

    if (existingIds.length > 0) {
      await this.prisma.userAnswerSelection.deleteMany({
        where: {
          userAnswerId: { in: existingIds },
        },
      });

      await this.prisma.userAnswer.deleteMany({
        where: {
          id: { in: existingIds },
        },
      });
    }
    const createdAnswer = await this.prisma.userAnswer.create({
      data: {
        ...restParams,
        userId,
      },
    });
    await Promise.all(
      params.answers.map(async (answer) => {
        await this.prisma.userAnswerSelection.create({
          data: {
            answerOptionId: answer,
            userAnswerId: createdAnswer.id,
          },
        });
      })
    );
  }
}
