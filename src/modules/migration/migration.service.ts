import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SFIALevel } from '@prisma/client';
import { AssessmentMethodSeedEnum } from 'prisma/seed/constant/assessmentMethodSeedEnum';

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

      const frameworks = await this.getFrameworksWithFullData();

      const pillarFrameworkStats = await this.migratePillarFrameworkFromData(frameworks);
      this.logger.log(`✅ Created ${pillarFrameworkStats.created} PillarFramework records`);

      const aspectPillarStats = await this.migrateAspectPillarFromData(frameworks);
      this.logger.log(`✅ Created ${aspectPillarStats.created} AspectPillar records`);

      const aspectPillarLevelStats = await this.migrateAspectPillarLevel();
      this.logger.log(`✅ Created ${aspectPillarLevelStats.created} AspectPillarLevel records`);

      const frameworkLevelStats = await this.migrateFrameworkLevelFromData(frameworks);
      this.logger.log(`✅ Created ${frameworkLevelStats.created} FrameworkLevel records`);

      const frameworkAssessmentStats = await this.migrateFrameworkAssessment(frameworks);
      this.logger.log(`✅ Created ${frameworkAssessmentStats.created} FrameworkAssessment records`);

      this.logger.log('✅ Framework Intermediate Tables Migration completed successfully');

      return {
        success: true,
        message: 'Framework Intermediate Tables Migration completed successfully',
        details: {
          pillarFrameworksCreated: pillarFrameworkStats.created,
          aspectPillarsCreated: aspectPillarStats.created,
          aspectPillarLevelsCreated: aspectPillarLevelStats.created,
          frameworkLevelsCreated: frameworkLevelStats.created,
          frameworkAssessmentsCreated: frameworkAssessmentStats.created,
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

  private async migratePillarFrameworkFromData(frameworks: any[]) {
    let created = 0;

    for (const framework of frameworks) {
      for (const pillar of framework.pillars) {
        const existing = await this.prisma.pillarFramework.findFirst({
          where: {
            frameworkId: framework.id,
            pillarId: pillar.id,
          },
        });

        if (!existing) {
          await this.prisma.pillarFramework.create({
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
        }
      }
    }

    return { created };
  }

  private async migrateAspectPillarFromData(frameworks: any[]) {
    let created = 0;

    for (const framework of frameworks) {
      for (const pillar of framework.pillars) {
        for (const aspect of pillar.aspects) {
          const existing = await this.prisma.aspectPillar.findFirst({
            where: {
              pillarId: pillar.id,
              aspectId: aspect.id,
            },
          });

          if (!existing) {
            await this.prisma.aspectPillar.create({
              data: {
                pillarId: pillar.id,
                aspectId: aspect.id,
                weightWithinDimension: aspect.weightWithinDimension,
              },
            });
            created++;
            this.logger.log(
              `Created AspectPillar: ${pillar.dimension} -> ${aspect.name} (weight: ${aspect.weightWithinDimension})`
            );
          }
        }
      }
    }

    return { created };
  }

  private async migrateFrameworkLevelFromData(frameworks: any[]) {
    let created = 0;

    const levels = await this.prisma.level.findMany({
      where: { isActive: true },
      select: { id: true, numericValue: true, name: true },
    });

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
              description: `${level.name} requirements for ${framework.name}`,
            },
          });
          created++;
        }
      }

      this.logger.log(`Created FrameworkLevel for: ${framework.name} (${levels.length} levels)`);
    }

    return { created };
  }

  private async migrateAspectPillarLevel() {
    let created = 0;

    const aspectPillars = await this.prisma.aspectPillar.findMany({
      include: {
        aspect: { select: { name: true } },
        pillar: { select: { dimension: true } },
      },
    });

    const levels = await this.prisma.level.findMany({
      where: { isActive: true },
      select: { id: true, numericValue: true },
    });

    for (const aspectPillar of aspectPillars) {
      for (const level of levels) {
        const existing = await this.prisma.aspectPillarLevel.findFirst({
          where: {
            aspectPillarId: aspectPillar.id,
            levelId: level.id,
          },
        });

        if (!existing) {
          await this.prisma.aspectPillarLevel.create({
            data: {
              aspectPillarId: aspectPillar.id,
              levelId: level.id,
              description: `Level ${level.numericValue} description for ${aspectPillar.aspect.name} in ${aspectPillar.pillar.dimension}`,
            },
          });
          created++;
        }
      }

      this.logger.log(
        `Created AspectPillarLevel for: ${aspectPillar.pillar.dimension} -> ${aspectPillar.aspect.name} (${levels.length} levels)`
      );
    }

    return { created };
  }

  /**
   * Migrate FrameworkAssessment - populate junction table between Framework and AssessmentMethod
   * Weight distribution: TEST_ONLINE (30%), EVIDENCE (10%), INTERVIEW (60%)
   */
  private async migrateFrameworkAssessment(frameworks: any[]) {
    let createdCount = 0;

    const assessmentMethods = await this.prisma.assessmentMethod.findMany({
      select: { id: true, name: true },
    });

    const weightMap: Record<string, number> = {
      [AssessmentMethodSeedEnum.TEST_ONLINE]: 0.3,
      [AssessmentMethodSeedEnum.EVIDENCE]: 0.1,
      [AssessmentMethodSeedEnum.INTERVIEW]: 0.6,
    };

    for (const framework of frameworks) {
      for (const method of assessmentMethods) {
        const weight = weightMap[method.name];

        if (weight === undefined) {
          this.logger.warn(`Unknown assessment method: ${method.name}, skipping for framework ${framework.id}`);
          continue;
        }

        const existing = await this.prisma.frameworkAssessment.findUnique({
          where: {
            frameworkId_assessmentMethodId: {
              frameworkId: framework.id,
              assessmentMethodId: method.id,
            },
          },
        });

        if (existing) {
          this.logger.log(
            `FrameworkAssessment already exists for framework ${framework.name} and method ${method.name}, skipping`
          );
          continue;
        }

        await this.prisma.frameworkAssessment.create({
          data: {
            frameworkId: framework.id,
            assessmentMethodId: method.id,
            weightWithinFramework: weight,
          },
        });

        createdCount++;
        this.logger.log(`Created FrameworkAssessment: ${framework.name} + ${method.name} = ${weight * 100}%`);
      }
    }

    return { created: createdCount };
  }
}
