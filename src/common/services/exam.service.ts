// src/modules/common/exam-query.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { CompetencyDimension, ExamLevelEnum, SFIALevel } from '@prisma/client';

@Injectable()
export class ExamServiceCommon {
  private readonly logger = new Logger(ExamServiceCommon.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapExamLevelToSFIALevel(level: ExamLevelEnum): SFIALevel {
    const mapping: Record<ExamLevelEnum, SFIALevel> = {
      [ExamLevelEnum.LEVEL_1_STARTER]: SFIALevel.LEVEL_1_AWARENESS,
      [ExamLevelEnum.LEVEL_2_EXPLORER]: SFIALevel.LEVEL_2_FOUNDATION,
      [ExamLevelEnum.LEVEL_3_PRACTITIONER]: SFIALevel.LEVEL_3_APPLICATION,
      [ExamLevelEnum.LEVEL_4_INTEGRATOR]: SFIALevel.LEVEL_4_INTEGRATION,
      [ExamLevelEnum.LEVEL_5_STRATEGIST]: SFIALevel.LEVEL_5_INNOVATION,
      [ExamLevelEnum.LEVEL_6_LEADER]: SFIALevel.LEVEL_6_LEADERSHIP,
      [ExamLevelEnum.LEVEL_7_EXPERT]: SFIALevel.LEVEL_7_MASTERY,
    };
    return mapping[level];
  }

  async getCoursesByExamLevel(examLevel: ExamLevelEnum, userId: string) {
    const mappedLevel = this.mapExamLevelToSFIALevel(examLevel);

    const allCourses = await this.prisma.course.findMany({
      where: {
        isActive: true,
      },
      include: {
        userProgress: {
          where: {
            userId: userId,
          },
        },
      },
    });

    const filteredCourses = allCourses.filter((course) => {
      if (!course.sfiaLevels || course.sfiaLevels.length === 0) return false;

      return course.sfiaLevels.some((sfia) => SFIALevel[sfia] >= SFIALevel[mappedLevel]);
    });
    const coursesWithRegistrationStatus = filteredCourses.map((course) => {
      const { userProgress, ...courseData } = course;
      const isRegistered = userProgress.length > 0;

      return {
        ...courseData,
        isRegistered,
      };
    });
    return coursesWithRegistrationStatus;
  }

  async calcElapsed(start: Date, end: Date): Promise<string> {
    const diffMs = end.getTime() - start.getTime();
    const h = Math.floor(diffMs / 3600000)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((diffMs % 3600000) / 60000)
      .toString()
      .padStart(2, '0');
    const s = Math.floor((diffMs % 60000) / 1000)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  async mapQuestionsWithAnswers(examQuestions: any[], userAnswers: any[]) {
    const userAnswerMap: Record<string, string[]> = {};
    userAnswers.forEach((ua) => (userAnswerMap[ua.questionId] = ua.selections.map((s) => s.answerOptionId)));

    let correctCount = 0,
      wrongCount = 0,
      skippedCount = 0;

    const questions = examQuestions.map((q) => {
      const opts = q.question.answerOptions;
      const correct = opts.filter((o) => o.isCorrect).map((o) => o.id);
      const selected = userAnswerMap[q.questionId] || [];

      let status: 'correct' | 'wrong' | 'skipped';
      if (!selected.length) {
        skippedCount++;
        status = 'skipped';
      } else if (selected.every((id) => correct.includes(id)) && correct.length === selected.length) {
        correctCount++;
        status = 'correct';
      } else {
        wrongCount++;
        status = 'wrong';
      }

      return {
        questionId: q.questionId,
        question: q.question.content,
        answers: opts,
        userAnswers: selected,
        sequence: q.question.sequence,
        status,
      };
    });

    questions.sort((a, b) => a.sequence - b.sequence);
    return { correctCount, wrongCount, skippedCount, questions };
  }

  async findExamById(examId: string) {
    return this.prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        startedAt: true,
        sfiaLevel: true,
        overallScore: true,
        examStatus: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, fullName: true, email: true } },
        examLevel: {
          select: {
            examLevel: true,
          },
        },
        examSet: { select: { id: true, name: true } },
        examPillarSnapshot: {
          select: {
            score: true,
            pillar: { select: { id: true, name: true } },
          },
        },
        examAspectSnapshot: {
          select: {
            score: true,
            aspect: { select: { id: true, name: true, represent: true, pillarId: true } },
          },
        },
      },
    });
  }

  async detectPillarScoresByAspect(examPillarSnapshot: any[], examAspectSnapshot: any[], isSetAspect: boolean) {
    const pillarsWithAspects = examPillarSnapshot.map((pillarSnapshot) => {
      const pillar = pillarSnapshot.pillar;

      const aspects = examAspectSnapshot
        .filter((aspectSnapshot) => aspectSnapshot.aspect.pillarId === pillar.id)
        .map((aspectSnapshot) => ({
          id: aspectSnapshot.aspect.id,
          name: aspectSnapshot.aspect.name,
          represent: aspectSnapshot.aspect.represent,
          score: Number(aspectSnapshot.score),
        }));

      return {
        id: pillar.id,
        name: pillar.name,
        score: Number(pillarSnapshot.score),
        ...(isSetAspect ? { aspects } : {}),
      };
    });

    return pillarsWithAspects.reduce(
      (acc, snapshot) => {
        const name = snapshot.name.toUpperCase();

        switch (name) {
          case CompetencyDimension.MINDSET:
            acc.mindsetScore = snapshot;
            break;
          case CompetencyDimension.SKILLSET:
            acc.skillsetScore = snapshot;
            break;
          case CompetencyDimension.TOOLSET:
            acc.toolsetScore = snapshot;
            break;
        }
        return acc;
      },
      {
        mindsetScore: null,
        skillsetScore: null,
        toolsetScore: null,
      }
    );
  }
}
