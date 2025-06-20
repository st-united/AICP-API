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
      throw new Error(error.message || 'Đã xảy ra lỗi khi lưu câu trả lời');
    }
  }

  async update(userId: string, examId: string): Promise<ResponseItem<userAnswerDto>> {
    const existingExam = await this.prisma.exam.findFirst({
      where: { id: examId },
    });

    if (existingExam.examStatus !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException('Bài kiểm tra này đã được nộp trước đó.');
    }

    try {
      await this.prisma.userAnswer.updateMany({
        where: { userId, examId },
        data: { status: UserAnswerStatus.SUBMIT },
      });

      const [existingAnswers, examQuestions, pillars] = await Promise.all([
        this.prisma.userAnswer.findMany({
          where: { userId, examId, status: UserAnswerStatus.SUBMIT },
          select: { id: true, questionId: true },
        }),
        this.prisma.examSetQuestion.findMany({
          where: { examSetId: existingExam.examSetId },
          include: {
            question: {
              select: {
                maxPossibleScore: true,
                skill: {
                  select: {
                    aspect: {
                      select: {
                        competencyPillar: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        this.prisma.competencyPillar.findMany({
          where: {
            name: {
              in: [CompetencyDimension.MINDSET, CompetencyDimension.SKILLSET, CompetencyDimension.TOOLSET],
            },
          },
        }),
      ]);

      const userAnswerIds = existingAnswers.map((a) => a.id);
      const questionIds = existingAnswers.map((a) => a.questionId);

      const [matchingSelections, answerOptions] = await Promise.all([
        this.prisma.userAnswerSelection.findMany({
          where: { userAnswerId: { in: userAnswerIds } },
          include: { userAnswer: { select: { id: true, questionId: true } } },
        }),
        this.prisma.answerOption.findMany({
          where: { questionId: { in: questionIds } },
          select: {
            id: true,
            content: true,
            isCorrect: true,
            questionId: true,
            question: {
              select: {
                maxPossibleScore: true,
                skill: {
                  select: {
                    aspect: {
                      select: {
                        competencyPillar: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

      const scoreMeta = this.calculateTotalScorePerPillar(examQuestions);
      const groupedSelections = this.groupSelections(matchingSelections);
      const groupedByQuestion = this.groupAnswerOptions(answerOptions);

      const classificationResult = this.classifyAnswers(groupedSelections, groupedByQuestion);

      let totalScores = {
        [CompetencyDimension.MINDSET]: 0,
        [CompetencyDimension.SKILLSET]: 0,
        [CompetencyDimension.TOOLSET]: 0,
      };

      const scorePerQuestion: Record<string, any> = {};

      for (const [userAnswerId, result] of Object.entries(classificationResult)) {
        const { TP, FP, FN, pillarName, maxScorePerQuestion } = result;

        const precision = TP.length + FP.length ? TP.length / (TP.length + FP.length) : 0;
        const recall = TP.length + FN.length ? TP.length / (TP.length + FN.length) : 0;
        const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
        const finalScore = f1 * maxScorePerQuestion;

        if (pillarName && totalScores[pillarName] !== undefined) {
          totalScores[pillarName] += finalScore;
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

      const mindScore = (totalScores[CompetencyDimension.MINDSET] / scoreMeta.mindset) * 7 || 0;
      const skillScore = (totalScores[CompetencyDimension.SKILLSET] / scoreMeta.skillset) * 7 || 0;
      const toolScore = (totalScores[CompetencyDimension.TOOLSET] / scoreMeta.toolset) * 7 || 0;

      const finalScore =
        mindScore *
          (pillars.find((p) => p.name === CompetencyDimension.MINDSET)?.weightWithinDimension.toNumber() || 0) +
        skillScore *
          (pillars.find((p) => p.name === CompetencyDimension.SKILLSET)?.weightWithinDimension.toNumber() || 0) +
        toolScore *
          (pillars.find((p) => p.name === CompetencyDimension.TOOLSET)?.weightWithinDimension.toNumber() || 0);

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
      return new ResponseItem(null, 'Đã nộp bài thành công');
    } catch (error) {
      throw new Error(error);
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

  private calculateTotalScorePerPillar(questions: any[]) {
    let mindset = 0,
      skillset = 0,
      toolset = 0;

    for (const q of questions) {
      const name = q.question.skill?.aspect?.competencyPillar?.name;
      const score = q.question.maxPossibleScore?.toNumber() || 0;

      if (name === CompetencyDimension.MINDSET) mindset += score;
      if (name === CompetencyDimension.SKILLSET) skillset += score;
      if (name === CompetencyDimension.TOOLSET) toolset += score;
    }

    return { mindset, skillset, toolset };
  }

  private groupSelections(selections: any[]) {
    return selections.reduce(
      (acc, { userAnswerId, answerOptionId, userAnswer }) => {
        const questionId = userAnswer?.questionId;
        if (!acc[userAnswerId]) {
          acc[userAnswerId] = { userAnswerId, questionId, answerOptionIds: [] };
        }
        acc[userAnswerId].answerOptionIds.push(answerOptionId);
        return acc;
      },
      {} as Record<string, { userAnswerId: string; questionId: string; answerOptionIds: string[] }>
    );
  }

  private groupAnswerOptions(answerOptions: any[]) {
    return answerOptions.reduce(
      (acc, curr) => {
        const { questionId, id, content, isCorrect, question } = curr;
        const pillarName = question?.skill?.aspect?.competencyPillar?.name || null;
        const maxPossibleScore = question?.maxPossibleScore.toNumber() || 0;

        if (!acc[questionId]) {
          acc[questionId] = { questionId, pillarName, maxPossibleScore, options: [] };
        }

        acc[questionId].options.push({ id, content, isCorrect });
        return acc;
      },
      {} as Record<string, any>
    );
  }

  private classifyAnswers(selections: any, groupedOptions: any) {
    const result: Record<string, any> = {};

    for (const userAnswerId in selections) {
      const { questionId, answerOptionIds } = selections[userAnswerId];
      const options = groupedOptions[questionId]?.options || [];
      const pillarName = groupedOptions[questionId]?.pillarName || null;
      const maxScorePerQuestion = groupedOptions[questionId]?.maxPossibleScore || 0;

      const TP: string[] = [],
        FP: string[] = [],
        FN: string[] = [],
        TN: string[] = [];
      const selectedSet = new Set(answerOptionIds);

      for (const option of options) {
        const isSelected = selectedSet.has(option.id);

        if (option.isCorrect) {
          isSelected ? TP.push(option.id) : FN.push(option.id);
        } else {
          isSelected ? FP.push(option.id) : TN.push(option.id);
        }
      }

      result[userAnswerId] = { TP, FP, FN, TN, pillarName, maxScorePerQuestion };
    }

    return result;
  }
}
