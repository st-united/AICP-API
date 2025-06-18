import { BadRequestException, Injectable } from '@nestjs/common';
import { userAnswerDto } from './dto/request/user-answer.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { UserAnswerStatus, ExamStatus, CompetencyDimension } from '@prisma/client';
import { ResponseItem } from '@app/common/dtos';
import { log } from 'console';

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

  async update(userId: string, examId: string): Promise<ResponseItem<userAnswerDto>> {
    const existingExam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
      },
    });

    if (existingExam.examStatus !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException('Bài kiểm tra này đã được nộp trước đó.');
    }
    try {
      await this.prisma.userAnswer.updateMany({
        where: { userId, examId },
        data: { status: UserAnswerStatus.SUBMIT },
      });

      const existingAnswers = await this.prisma.userAnswer.findMany({
        where: { userId, examId, status: UserAnswerStatus.SUBMIT },
        select: { id: true, questionId: true },
      });

      const userAnswerIds = existingAnswers.map((a) => a.id);
      const questionIds = existingAnswers.map((a) => a.questionId);

      const matchingSelections = await this.prisma.userAnswerSelection.findMany({
        where: { userAnswerId: { in: userAnswerIds } },
        include: { userAnswer: { select: { id: true, questionId: true } } },
      });

      // const answerOptions = await this.prisma.answerOption.findMany({
      //   where: { questionId: { in: questionIds } },
      //   select: { id: true, content: true, isCorrect: true, questionId: true },
      // });

      const answerOptions = await this.prisma.answerOption.findMany({
        where: { questionId: { in: questionIds } },
        select: {
          id: true,
          content: true,
          isCorrect: true,
          questionId: true,
          question: {
            select: {
              skill: {
                select: {
                  aspect: {
                    select: {
                      competencyPillar: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
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
          const { questionId, id, content, isCorrect, question } = curr;

          const pillarName = question?.skill?.aspect?.competencyPillar?.name || null;

          if (!acc[questionId]) {
            acc[questionId] = { questionId, pillarName, options: [] };
          }
          acc[questionId].options.push({ id, content, isCorrect });
          return acc;
        },
        {} as Record<
          string,
          { questionId: string; pillarName: string; options: { id: string; content: string; isCorrect: boolean }[] }
        >
      );
      const classificationResult: Record<
        string,
        { TP: string[]; FP: string[]; FN: string[]; TN: string[]; pillarName: string | null }
      > = {};

      for (const userAnswerId in groupedSelections) {
        const { questionId, answerOptionIds: selectedIds } = groupedSelections[userAnswerId];
        const options = groupedByQuestion[questionId]?.options || [];
        const pillarName = groupedByQuestion[questionId]?.pillarName || null;

        const TP: string[] = [];
        const FP: string[] = [];
        const FN: string[] = [];
        const TN: string[] = [];

        const selectedSet = new Set(selectedIds);

        for (const option of options) {
          const isSelected = selectedSet.has(option.id);

          if (option.isCorrect) {
            if (isSelected) TP.push(option.id);
            else FN.push(option.id);
          } else {
            if (isSelected) FP.push(option.id);
            else TN.push(option.id);
          }
        }

        classificationResult[userAnswerId] = { TP, FP, FN, TN, pillarName };
      }

      const maxScorePerQuestion = 4;
      const scorePerQuestion: Record<
        string,
        {
          precision: number;
          recall: number;
          f1: number;
          finalScore: number;
        }
      > = {};

      let totalMindsetScore = 0;
      let totalSkillsetScore = 0;
      let totalToolsetScore = 0;

      for (const userAnswerId in classificationResult) {
        const { TP, FP, FN, pillarName } = classificationResult[userAnswerId];

        const tp = TP.length;
        const fp = FP.length;
        const fn = FN.length;

        const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
        const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
        const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
        const finalScore = f1 * maxScorePerQuestion;

        if (pillarName === CompetencyDimension.MINDSET) {
          totalMindsetScore += finalScore;
        } else if (pillarName === CompetencyDimension.SKILLSET) {
          totalSkillsetScore += finalScore;
        } else if (pillarName === CompetencyDimension.TOOLSET) {
          totalToolsetScore += finalScore;
        }

        await this.prisma.userAnswer.update({
          where: { id: userAnswerId },
          data: { autoScore: finalScore },
        });

        scorePerQuestion[userAnswerId] = {
          precision: +precision.toFixed(3),
          recall: +recall.toFixed(3),
          f1: +f1.toFixed(3),
          finalScore: +finalScore.toFixed(2),
        };
      }

      const totalScore = Object.values(scorePerQuestion).reduce((sum, curr) => sum + curr.finalScore, 0);

      const mindScore = (totalMindsetScore / 78) * 7;
      const skillScore = (totalSkillsetScore / 42) * 7;
      const toolScore = (totalToolsetScore / 21) * 7;

      const finalScore = mindScore * 0.55 + skillScore * 0.3 + toolScore * 0.15;

      await this.prisma.exam.update({
        where: { id: examId },
        data: {
          mindsetScore: mindScore,
          skillsetScore: skillScore,
          toolsetScore: toolScore,
          overallScore: finalScore,
          examStatus: ExamStatus.SUBMITTED,
        },
      });

      log('Score Per Question:', scorePerQuestion);
      log('Tổng điểm toàn bài:', totalScore);
      log('Classification Result:', JSON.stringify(classificationResult, null, 2));
      log('Grouped Selections:', groupedSelections);
      log('Grouped By Question:', JSON.stringify(groupedByQuestion, null, 2));

      // const scores = await Promise.all(
      //   Object.entries(groupedSelections).map(async ([userAnswerId, { questionId, answerOptionIds }]) => {
      //     const questionData = groupedByQuestion[questionId];
      //     if (!questionData) return [userAnswerId, 0];

      //     const correctOptionIds = questionData.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);

      //     const totalCorrect = correctOptionIds.length;

      //     const matchedCorrect = answerOptionIds.filter((id) => correctOptionIds.includes(id)).length;

      //     const rawScore = matchedCorrect / totalCorrect;

      //     const score = parseFloat(rawScore.toFixed(2));

      //     const userAnswer = await this.prisma.userAnswer.findFirst({
      //       where: {
      //         userId: userAnswerId,
      //         examId,
      //       },
      //     });

      //     if (userAnswer) {
      //       await this.prisma.userAnswer.update({
      //         where: { id: userAnswer.id },
      //         data: { autoScore: score },
      //       });
      //     }

      //     return [userAnswerId, score];
      //   })
      // );

      // const totalScore = scores.reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : Number(val)), 0);

      // await this.prisma.exam.update({
      //   where: { id: examId },
      //   data: {
      //     examStatus: 'SUBMITTED',
      //     overallScore: totalScore,
      //   },
      // });

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
