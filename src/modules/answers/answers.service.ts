import { BadRequestException, Injectable } from '@nestjs/common';
import { userAnswerDto } from './dto/request/user-answer.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { UserAnswerStatus, ExamStatus, CompetencyDimension, SFIALevel, ExamLevelEnum } from '@prisma/client';
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
      throw new Error(error.message || 'Đã xảy ra lỗi khi lưu câu trả lời');
    }
  }

  async update(userId: string, examId: string): Promise<ResponseItem<userAnswerDto>> {
    const totalScoresPerAspect: Record<string, Record<string, { score: number; maxScore: number }>> = {};
    const scorePerQuestion: Record<string, any> = {};
    const totalScorePerPillar: Record<
      string,
      { id: string; weightedScore: number; rawScore: number; weightWithinDimension: number }
    > = {};
    const existingExam = await this.prisma.exam.findFirst({
      where: { id: examId },
    });

    if (existingExam?.examStatus !== ExamStatus.IN_PROGRESS) {
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
                        id: true,
                        name: true,
                        aspectPillars: {
                          select: {
                            weightWithinDimension: true,
                            pillar: { select: { id: true, name: true } },
                          },
                        },
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
            isCorrect: true,
            questionId: true,
            question: {
              select: {
                maxPossibleScore: true,
                skill: {
                  select: {
                    aspect: {
                      select: {
                        name: true,
                        aspectPillars: {
                          select: {
                            pillar: { select: { name: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

      const scoreMeta = this.mapAspectWeightsPerPillar(examQuestions);
      const groupedSelections = this.groupSelections(matchingSelections);
      const groupedByQuestion = this.groupAnswerOptions(answerOptions);
      const classificationResult = this.classifyAnswers(groupedSelections, groupedByQuestion);

      await Promise.all(
        Object.entries(classificationResult).map(async ([userAnswerId, result]) => {
          const { TP, FP, FN, pillarName, aspectName, maxScorePerQuestion } = result;

          const precision = TP.length + FP.length ? TP.length / (TP.length + FP.length) : 0;
          const recall = TP.length + FN.length ? TP.length / (TP.length + FN.length) : 0;
          const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
          const finalScore = f1 * maxScorePerQuestion;

          if (pillarName && aspectName) {
            totalScoresPerAspect[pillarName] ??= {};
            totalScoresPerAspect[pillarName][aspectName] ??= { score: 0, maxScore: 0 };

            totalScoresPerAspect[pillarName][aspectName].score += finalScore;
            totalScoresPerAspect[pillarName][aspectName].maxScore += maxScorePerQuestion;
          }

          scorePerQuestion[userAnswerId] = {
            precision: +precision.toFixed(3),
            recall: +recall.toFixed(3),
            f1: +f1.toFixed(3),
            finalScore: +finalScore.toFixed(2),
          };

          await this.prisma.userAnswer.update({
            where: { id: userAnswerId },
            data: { autoScore: finalScore },
          });
        })
      );

      const aspectScoresPerPillar = ['MINDSET', 'SKILLSET', 'TOOLSET'].reduce(
        (result, aspect) => {
          result[aspect] = this.isNonEmpty(totalScoresPerAspect[aspect])
            ? this.calculateAspectScoresPerPillar(totalScoresPerAspect, scoreMeta, aspect)
            : {};
          return result;
        },
        {} as Record<string, Record<string, { weighted: number; raw: number }>>
      );

      const validPillarIds = pillars.map((p) => p.id);

      const aspectPillars = await this.prisma.aspectPillar.findMany({
        where: { pillarId: { in: validPillarIds } },
        select: {
          weightWithinDimension: true,
          aspect: {
            select: { id: true, name: true },
          },
          pillar: {
            select: { id: true, name: true },
          },
        },
      });

      const examSet = await this.prisma.examSet.findUnique({
        where: { id: existingExam.examSetId },
        select: { frameworkId: true },
      });

      const pillarFrameworks = await this.prisma.pillarFramework.findMany({
        where: {
          frameworkId: examSet.frameworkId,
          pillarId: { in: validPillarIds },
        },
        select: {
          pillarId: true,
          weightWithinDimension: true,
        },
      });

      const pillarWeightMap = Object.fromEntries(
        pillarFrameworks.map((pf) => [pf.pillarId, pf.weightWithinDimension.toNumber()])
      );

      const snapshots = aspectPillars.map((ap) => {
        const aspectName = ap.aspect.name;
        const aspectId = ap.aspect.id;
        const pillarName = ap.pillar.name;
        const pillarId = ap.pillar.id;

        const weightedScore = aspectScoresPerPillar[pillarName]?.[aspectName]?.weighted ?? 0;
        const rawScore = aspectScoresPerPillar[pillarName]?.[aspectName]?.raw ?? 0;

        totalScorePerPillar[pillarName] ??= {
          id: pillarId,
          weightedScore: 0,
          rawScore: 0,
          weightWithinDimension: pillarWeightMap[pillarId] ?? 0,
        };
        totalScorePerPillar[pillarName].weightedScore += weightedScore;
        totalScorePerPillar[pillarName].rawScore += rawScore;

        return { aspectId, weightedScore, rawScore };
      });

      await Promise.all([
        ...snapshots.map((s) =>
          this.prisma.examAspectSnapshot.upsert({
            where: { examId_aspectId: { examId, aspectId: s.aspectId } },
            create: { examId, aspectId: s.aspectId, score: s.rawScore },
            update: { score: s.rawScore },
          })
        ),
        ...Object.values(totalScorePerPillar).map((s) =>
          this.prisma.examPillarSnapshot.upsert({
            where: { examId_pillarId: { examId, pillarId: s.id } },
            create: { examId, pillarId: s.id, score: s.weightedScore },
            update: { score: s.weightedScore },
          })
        ),
      ]);

      const overallScore = +Object.values(totalScorePerPillar)
        .reduce((acc, s) => acc + s.weightedScore * s.weightWithinDimension, 0)
        .toFixed(2);
      const level = await this.getSFIALevel(overallScore);
      const levelNumber = level.split('_')[1];
      const matchedExamLevels = Object.values(ExamLevelEnum).filter((level) =>
        level.startsWith(`LEVEL_${levelNumber}_`)
      );

      const examLevels = await this.prisma.examLevel.findFirst({
        where: {
          examLevel: {
            in: matchedExamLevels,
          },
        },
      });

      const levelRecord = await this.prisma.level.findFirst({
        where: {
          sfiaLevel: level,
          isActive: true,
        },
      });

      await this.prisma.exam.update({
        where: { id: examId },
        data: {
          overallScore,
          examStatus: ExamStatus.SUBMITTED,
          sfiaLevel: level,
          levelId: levelRecord?.id || null,
          examLevelId: examLevels ? examLevels.id : null,
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

  private async getSFIALevel(overallScore: number): Promise<SFIALevel> {
    let numericValue = 1;
    if (overallScore >= 7) {
      numericValue = 7;
    } else if (overallScore >= 6) {
      numericValue = 6;
    } else if (overallScore >= 5) {
      numericValue = 5;
    } else if (overallScore >= 4) {
      numericValue = 4;
    } else if (overallScore >= 3) {
      numericValue = 3;
    } else if (overallScore >= 2) {
      numericValue = 2;
    }

    const levelRecord = await this.prisma.level.findFirst({
      where: {
        numericValue,
        isActive: true,
      },
    });

    if (!levelRecord) {
      if (overallScore < 2) return SFIALevel.LEVEL_1_AWARENESS;
      if (overallScore < 3) return SFIALevel.LEVEL_2_FOUNDATION;
      if (overallScore < 4) return SFIALevel.LEVEL_3_APPLICATION;
      if (overallScore < 5) return SFIALevel.LEVEL_4_INTEGRATION;
      if (overallScore < 6) return SFIALevel.LEVEL_5_INNOVATION;
      if (overallScore < 7) return SFIALevel.LEVEL_6_LEADERSHIP;
      return SFIALevel.LEVEL_7_MASTERY;
    }

    return levelRecord.sfiaLevel;
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

  private mapAspectWeightsPerPillar(questions: any[]) {
    const pillarMap: Record<string, Record<string, { weight: number }>> = {
      MINDSET: {},
      SKILLSET: {},
      TOOLSET: {},
    };

    for (const questionItem of questions) {
      const aspect = questionItem.question?.skill?.aspect;
      const aspectName = aspect?.name;
      const aspectPillars = aspect?.aspectPillars || [];

      if (!aspectName || aspectPillars.length === 0) continue;

      // Get the first pillar relationship (or you could loop through all)
      for (const ap of aspectPillars) {
        const pillarName = ap.pillar?.name;
        const weight = ap.weightWithinDimension ?? 0;

        if (!pillarName || !pillarMap[pillarName]) continue;

        if (!pillarMap[pillarName][aspectName]) {
          pillarMap[pillarName][aspectName] = { weight: Number(weight) };
        }
      }
    }

    return pillarMap;
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
        const aspect = question?.skill?.aspect;
        const aspectPillars = aspect?.aspectPillars || [];
        const pillarName = aspectPillars[0]?.pillar?.name || null;
        const aspectName = aspect?.name || null;
        const maxPossibleScore = question?.maxPossibleScore.toNumber() || 0;

        if (!acc[questionId]) {
          acc[questionId] = { questionId, pillarName, aspectName, maxPossibleScore, options: [] };
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
      const aspectName = groupedOptions[questionId]?.aspectName || null;
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

      result[userAnswerId] = { TP, FP, FN, TN, pillarName, aspectName, maxScorePerQuestion };
    }

    return result;
  }

  private calculateAspectScoresPerPillar(
    totalScoresPerAspect: Record<string, Record<string, { score: number; maxScore: number }>>,
    scoreMetaPerAspect: Record<string, Record<string, { weight: number }>>,
    pillarName: string
  ): Record<string, { weighted: number; raw: number }> {
    const aspectScores = totalScoresPerAspect[pillarName] || {};
    const aspectMeta = scoreMetaPerAspect[pillarName] || {};

    const result = Object.fromEntries(
      Object.entries(aspectMeta).map(([aspectName, meta]) => {
        const aspect = aspectScores[aspectName] || { score: 0, maxScore: 0 };
        const actual = aspect.score || 0;
        const max = aspect.maxScore || 0;
        const weight = Number(meta.weight) || 0;

        const rawScore = max > 0 ? +((actual / max) * 7).toFixed(2) : 0;
        const weightedScore = max > 0 ? +((actual / max) * 7 * weight).toFixed(2) : 0;

        return [aspectName, { weighted: weightedScore, raw: rawScore }];
      })
    );

    return result;
  }

  private isNonEmpty(obj: any): boolean {
    return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
  }

  async autoSubmitExpiredExams(): Promise<void> {
    const now = new Date();
    const tenSecondsAgo = new Date(now.getTime() - 10_000);

    const expiredExams = await this.prisma.exam.findMany({
      where: {
        examStatus: ExamStatus.IN_PROGRESS,
        finishedAt: {
          lte: tenSecondsAgo,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!expiredExams.length) return;

    const updatePromises = expiredExams.map((exam) =>
      this.update(exam.userId, exam.id).catch((error) => {
        console.error(`[AutoSubmit] Failed examId=${exam.id} userId=${exam.userId}`, error.message);
      })
    );

    await Promise.all(updatePromises);
  }
}
