import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SFIALevel } from '@prisma/client';

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Main migration method - runs all migration steps
   */
  async migrateToLevelSystem(): Promise<MigrationResult> {
    try {
      this.logger.log('Starting Level System Migration...');

      // Step 1: Create LevelScale
      const levelScale = await this.createLevelScale();
      this.logger.log(`✅ Created LevelScale: ${levelScale.id}`);

      // Step 2: Update existing 7 Level records
      const levels = await this.createLevels(levelScale.id);
      this.logger.log(`✅ Updated ${levels.length} existing Level records with scaleId and code`);

      // Step 3: Migrate existing data
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

  /**
   * Step 1: Create LevelScale record
   */
  private async createLevelScale() {
    // Check if already exists
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

  /**
   * Step 2: Update existing 7 Level records to link with LevelScale
   * Set code = sfiaLevel enum value
   */
  private async createLevels(scaleId: string) {
    // Get all existing levels
    const existingLevels = await this.prisma.level.findMany({
      orderBy: { numericValue: 'asc' },
    });

    if (existingLevels.length === 0) {
      throw new Error('No existing Level records found. Please ensure Level table has 7 records.');
    }

    this.logger.log(`Found ${existingLevels.length} existing Level records`);

    const updatedLevels = [];

    for (const level of existingLevels) {
      // Update with scaleId and code (code = sfiaLevel enum value)
      const updated = await this.prisma.level.update({
        where: { id: level.id },
        data: {
          scaleId,
          code: level.sfiaLevel, // Set code = enum value (e.g., "LEVEL_1_AWARENESS")
          isActive: true,
        },
      });

      updatedLevels.push(updated);
      this.logger.log(`Updated Level ${level.numericValue}: ${level.name} with scaleId and code=${level.sfiaLevel}`);
    }

    return updatedLevels;
  }

  /**
   * Step 3: Migrate existing data - populate levelId fields
   */
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

    // Create a map: SFIALevel -> Level ID
    const levelMap = new Map<SFIALevel, string>();
    levels.forEach((level) => {
      levelMap.set(level.sfiaLevel, level.id);
    });

    // Migrate Course
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

    // Migrate Exam
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

    // Migrate Mentor
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

    // Migrate MentorCompetency
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

    // Migrate CompetencySkill
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

    // Migrate CompetencyAssessment
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

    // Migrate CompetencyScore
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

    // Migrate LearningPath
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

    // Migrate Portfolio
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

  /**
   * Check migration status
   */
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
}
