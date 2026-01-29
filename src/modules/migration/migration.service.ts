import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SFIALevel } from '@prisma/client';
import { isArrayNotNullOrEmpty } from '@app/common/utils';

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async migrateToLevelSystem(): Promise<MigrationResult> {
    try {
      this.logger.log('Starting Level System Migration...');

      const levelScale = await this.createLevelScale();
      this.logger.log(`✅ Created LevelScale: ${levelScale.id}`);

      const levels = await this.createLevels(levelScale.id);
      this.logger.log(`✅ Updated ${levels.length} existing Level records with scaleId and code`);

      const migrationStats = await this.migrateExistingData(levels);
      this.logger.log('✅ Migration completed successfully');

      return {
        success: true,
        message: 'Level System Migration completed successfully',
        details: {
          levelScaleId: levelScale.id,
          levelsCreated: levels.length,
          ...migrationStats,
        },
      };
    } catch (error) {
      this.logger.error('Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error.message}`,
        details: error,
      };
    }
  }

  private async createLevelScale() {
    const existing = await this.prisma.levelScale.findFirst({
      where: { name: 'SFIA Framework' },
    });

    if (existing) {
      this.logger.log('LevelScale already exists, skipping creation');
      return existing;
    }

    return this.prisma.levelScale.create({
      data: {
        name: 'SFIA Framework',
        description: 'Skills Framework for the Information Age (SFIA) - Standard competency level scale',
        isActive: true,
      },
    });
  }

  private async createLevels(scaleId: string) {
    const existingLevels = await this.prisma.level.findMany({
      orderBy: { numericValue: 'asc' },
    });

    if (existingLevels.length === 0) {
      throw new Error('No existing Level records found. Please ensure Level table has 7 records.');
    }

    this.logger.log(`Found ${existingLevels.length} existing Level records`);

    const updatedLevels = [];

    for (const level of existingLevels) {
      const updated = await this.prisma.level.update({
        where: { id: level.id },
        data: {
          scaleId,
          code: level.sfiaLevel,
          isActive: true,
        },
      });

      updatedLevels.push(updated);
      this.logger.log(`Updated Level ${level.numericValue}: ${level.name} with scaleId and code=${level.sfiaLevel}`);
    }

    return updatedLevels;
  }

  private async migrateExistingData(levels: any[]) {
    const stats = {
      coursesUpdated: 0,
      examsUpdated: 0,
      mentorsUpdated: 0,
      mentorCompetenciesUpdated: 0,
      competencySkillsUpdated: 0,
      competencyAssessmentsUpdated: 0,
      competencyScoresUpdated: 0,
      learningPathsUpdated: 0,
      portfoliosUpdated: 0,
    };

    const levelMap = new Map<SFIALevel, string>();
    levels.forEach((level) => {
      levelMap.set(level.sfiaLevel, level.id);
    });

    const courses = await this.prisma.course.findMany({
      where: { levelId: null },
      select: { id: true, difficultyLevel: true },
    });

    for (const course of courses) {
      if (course.difficultyLevel && levelMap.has(course.difficultyLevel)) {
        await this.prisma.course.update({
          where: { id: course.id },
          data: { levelId: levelMap.get(course.difficultyLevel) },
        });
        stats.coursesUpdated++;
      }
    }

    const exams = await this.prisma.exam.findMany({
      where: { levelId: null },
      select: { id: true, sfiaLevel: true },
    });

    for (const exam of exams) {
      if (exam.sfiaLevel && levelMap.has(exam.sfiaLevel)) {
        await this.prisma.exam.update({
          where: { id: exam.id },
          data: { levelId: levelMap.get(exam.sfiaLevel) },
        });
        stats.examsUpdated++;
      }
    }

    const mentors = await this.prisma.mentor.findMany({
      where: { levelId: null },
      select: { id: true, sfiaLevel: true },
    });

    for (const mentor of mentors) {
      if (mentor.sfiaLevel && levelMap.has(mentor.sfiaLevel)) {
        await this.prisma.mentor.update({
          where: { id: mentor.id },
          data: { levelId: levelMap.get(mentor.sfiaLevel) },
        });
        stats.mentorsUpdated++;
      }
    }

    const mentorCompetencies = await this.prisma.mentorCompetency.findMany({
      where: { levelId: null },
      select: { mentorId: true, pillarId: true, sfiaLevel: true },
    });

    for (const mc of mentorCompetencies) {
      if (mc.sfiaLevel && levelMap.has(mc.sfiaLevel)) {
        await this.prisma.mentorCompetency.update({
          where: {
            mentorId_pillarId: {
              mentorId: mc.mentorId,
              pillarId: mc.pillarId,
            },
          },
          data: { levelId: levelMap.get(mc.sfiaLevel) },
        });
        stats.mentorCompetenciesUpdated++;
      }
    }

    const competencySkills = await this.prisma.competencySkill.findMany({
      where: { levelId: null },
      select: { id: true, sfiaLevel: true },
    });

    for (const skill of competencySkills) {
      if (skill.sfiaLevel && levelMap.has(skill.sfiaLevel)) {
        await this.prisma.competencySkill.update({
          where: { id: skill.id },
          data: { levelId: levelMap.get(skill.sfiaLevel) },
        });
        stats.competencySkillsUpdated++;
      }
    }

    const assessments = await this.prisma.competencyAssessment.findMany({
      where: { levelId: null },
      select: { id: true, sfiaLevel: true },
    });

    for (const assessment of assessments) {
      if (assessment.sfiaLevel && levelMap.has(assessment.sfiaLevel)) {
        await this.prisma.competencyAssessment.update({
          where: { id: assessment.id },
          data: { levelId: levelMap.get(assessment.sfiaLevel) },
        });
        stats.competencyAssessmentsUpdated++;
      }
    }

    const scores = await this.prisma.competencyScore.findMany({
      where: { levelId: null },
      select: { id: true, sfiaLevel: true },
    });

    for (const score of scores) {
      if (score.sfiaLevel && levelMap.has(score.sfiaLevel)) {
        await this.prisma.competencyScore.update({
          where: { id: score.id },
          data: { levelId: levelMap.get(score.sfiaLevel) },
        });
        stats.competencyScoresUpdated++;
      }
    }

    const learningPaths = await this.prisma.learningPath.findMany({
      where: { targetLevelId: null },
      select: { id: true, targetSfiaLevel: true },
    });

    for (const path of learningPaths) {
      if (path.targetSfiaLevel && levelMap.has(path.targetSfiaLevel)) {
        await this.prisma.learningPath.update({
          where: { id: path.id },
          data: { targetLevelId: levelMap.get(path.targetSfiaLevel) },
        });
        stats.learningPathsUpdated++;
      }
    }

    const portfolios = await this.prisma.portfolio.findMany({
      where: { levelId: null },
      select: { id: true, sfiaLevelClaimed: true },
    });

    for (const portfolio of portfolios) {
      if (portfolio.sfiaLevelClaimed && levelMap.has(portfolio.sfiaLevelClaimed)) {
        await this.prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { levelId: levelMap.get(portfolio.sfiaLevelClaimed) },
        });
        stats.portfoliosUpdated++;
      }
    }

    this.logger.log('Migration stats:', stats);
    return stats;
  }

  async checkMigrationStatus() {
    const levelScale = await this.prisma.levelScale.findFirst({
      where: { name: 'SFIA Framework' },
      include: {
        levels: {
          orderBy: { numericValue: 'asc' },
        },
      },
    });

    if (!levelScale) {
      return {
        migrated: false,
        message: 'LevelScale not found - migration not started',
      };
    }

    const stats = {
      levelScaleId: levelScale.id,
      levelsCount: levelScale.levels.length,
      levels: levelScale.levels.map((l) => ({
        numericValue: l.numericValue,
        code: l.code,
        name: l.name,
        sfiaLevel: l.sfiaLevel,
      })),
      dataStats: {
        coursesWithLevel: await this.prisma.course.count({ where: { levelId: { not: null } } }),
        examsWithLevel: await this.prisma.exam.count({ where: { levelId: { not: null } } }),
        mentorsWithLevel: await this.prisma.mentor.count({ where: { levelId: { not: null } } }),
        assessmentsWithLevel: await this.prisma.competencyAssessment.count({
          where: { levelId: { not: null } },
        }),
      },
    };

    return {
      migrated: true,
      message: 'Migration completed',
      ...stats,
    };
  }

  async migrateToIntermediateTables(): Promise<MigrationResult> {
    try {
      this.logger.log('Starting Framework Intermediate Tables Migration...');
      const levels = await this.prisma.level.findMany({
        where: { isActive: true },
        select: { id: true, numericValue: true, name: true, description: true },
      });
      const frameworks = await this.getFrameworksWithFullData();
      const pillarFrameworkStats = await this.migratePillarFrameworks(frameworks, levels);
      this.logger.log(`✅ Created ${pillarFrameworkStats.created} PillarFramework records`);
      this.logger.log(`✅ Created ${pillarFrameworkStats.aspectPillarFrameworksCreated} AspectPillarFramework records`);
      this.logger.log(
        `✅ Created ${pillarFrameworkStats.aspectPillarFrameworkLevelsCreated} AspectPillarFrameworkLevel records`
      );

      const frameworkLevelStats = await this.migrateFrameworkLevels(frameworks, levels);
      this.logger.log(`✅ Created ${frameworkLevelStats.created} FrameworkLevel records`);

      this.logger.log('✅ Framework Intermediate Tables Migration completed successfully');

      return {
        success: true,
        message: 'Framework Intermediate Tables Migration completed successfully',
        details: {
          pillarFrameworksCreated: pillarFrameworkStats.created,
          aspectPillarFrameworksCreated: pillarFrameworkStats.aspectPillarFrameworksCreated,
          aspectPillarFrameworkLevelsCreated: pillarFrameworkStats.aspectPillarFrameworkLevelsCreated,
          frameworkLevelsCreated: frameworkLevelStats.created,
        },
      };
    } catch (error) {
      this.logger.error('Framework Intermediate Tables Migration failed:', error);
      return {
        success: false,
        message: `Framework Intermediate Tables Migration failed: ${error.message}`,
        details: error,
      };
    }
  }

  private async getFrameworksWithFullData() {
    return await this.prisma.competencyFramework.findMany({
      select: {
        id: true,
        name: true,
        pillars: {
          select: {
            id: true,
            dimension: true,
            weightWithinDimension: true,
            aspects: {
              select: {
                id: true,
                name: true,
                weightWithinDimension: true,
              },
            },
          },
        },
      },
    });
  }

  private async migratePillarFrameworks(frameworks: any[], levels: any[]) {
    let created = 0;
    let aspectPillarFrameworksCreated = 0;
    let aspectPillarFrameworkLevelsCreated = 0;

    for (const framework of frameworks) {
      if (!isArrayNotNullOrEmpty(framework.pillars)) {
        continue;
      }
      for (const pillar of framework.pillars) {
        const existing = await this.prisma.pillarFramework.findFirst({
          where: {
            frameworkId: framework.id,
            pillarId: pillar.id,
          },
        });

        if (!existing) {
          const newPillarFramework = await this.prisma.pillarFramework.create({
            data: {
              frameworkId: framework.id,
              pillarId: pillar.id,
              weightWithinDimension: pillar.weightWithinDimension,
            },
          });
          created++;
          this.logger.log(
            `Created PillarFramework: ${framework.name} -> ${pillar.dimension} (weight: ${pillar.weightWithinDimension})`
          );

          const aspectStats = await this.migrateAspectPillarFrameworks(newPillarFramework.id, pillar.aspects, levels);
          aspectPillarFrameworksCreated += aspectStats.created;
          aspectPillarFrameworkLevelsCreated += aspectStats.aspectPillarFrameworkLevelsCreated;
        }
      }
    }

    return { created, aspectPillarFrameworksCreated, aspectPillarFrameworkLevelsCreated };
  }

  private async migrateAspectPillarFrameworks(pillarFrameworkId: string, aspects: any[], levels: any[]) {
    let created = 0;
    let aspectPillarFrameworkLevelsCreated = 0;
    if (!isArrayNotNullOrEmpty(aspects)) {
      return { created, aspectPillarFrameworkLevelsCreated };
    }

    for (const aspect of aspects) {
      const existing = await this.prisma.aspectPillarFramework.findFirst({
        where: {
          pillarFrameworkId: pillarFrameworkId,
          aspectId: aspect.id,
        },
      });

      if (!existing) {
        const newAspectPillarFramework = await this.prisma.aspectPillarFramework.create({
          data: {
            pillarFrameworkId: pillarFrameworkId,
            aspectId: aspect.id,
            weightWithinDimension: aspect.weightWithinDimension,
          },
        });
        created++;
        this.logger.log(
          `Created AspectPillarFramework: PillarFramework ${pillarFrameworkId} -> ${aspect.name} (weight: ${aspect.weightWithinDimension})`
        );

        const levelStats = await this.migrateAspectPillarFrameworkLevel(levels, newAspectPillarFramework.id);
        aspectPillarFrameworkLevelsCreated += levelStats.created;
      }
    }

    return { created, aspectPillarFrameworkLevelsCreated };
  }

  private async migrateFrameworkLevels(frameworks: any[], levels: any[]) {
    let created = 0;

    for (const framework of frameworks) {
      for (const level of levels) {
        const existing = await this.prisma.frameworkLevel.findFirst({
          where: {
            frameworkId: framework.id,
            levelId: level.id,
          },
        });

        if (!existing) {
          await this.prisma.frameworkLevel.create({
            data: {
              frameworkId: framework.id,
              levelId: level.id,
              description: level.description,
            },
          });
          created++;
        }
      }

      this.logger.log(`Created FrameworkLevel for: ${framework.name} (${levels.length} levels)`);
    }

    return { created };
  }

  private async migrateAspectPillarFrameworkLevel(
    levels: any[],
    aspectPillarFrameworkId: string
  ): Promise<{ created: number }> {
    let created = 0;

    if (!isArrayNotNullOrEmpty(levels)) {
      return { created };
    }
    for (const level of levels) {
      const existing = await this.prisma.aspectPillarFrameworkLevel.findFirst({
        where: {
          aspectPillarFrameworkId: aspectPillarFrameworkId,
          levelId: level.id,
        },
      });

      if (!existing) {
        await this.prisma.aspectPillarFrameworkLevel.create({
          data: {
            aspectPillarFrameworkId: aspectPillarFrameworkId,
            levelId: level.id,
            description: level.description,
          },
        });
        created++;
      }
    }

    return { created };
  }
}
