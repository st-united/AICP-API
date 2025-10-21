// src/common/services/exam-logic.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { CompetencyDimension, ExamLevelEnum, SFIALevel } from '@prisma/client';
import { mapExamLevelToSFIALevel } from '@app/common/utils/examUtils';

@Injectable()
export class ExamServiceCommon {
  private readonly logger = new Logger(ExamServiceCommon.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCoursesByExamLevel(examLevel: ExamLevelEnum, userId: string) {
    const mappedLevel = mapExamLevelToSFIALevel(examLevel);

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
