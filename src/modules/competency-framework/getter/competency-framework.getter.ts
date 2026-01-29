import { BadRequestException } from '@nestjs/common';
import { CompetencyDimension, Prisma } from '@prisma/client';
import { CompetencyPillarDto, FrameworkLevelDto } from '../dto/request/create-competency-framework.dto';

export const persistPillars = async (
  tx: Prisma.TransactionClient,
  frameworkId: string,
  pillars: Array<CompetencyPillarDto | undefined>,
  levels?: FrameworkLevelDto[]
): Promise<void> => {
  if (levels && levels.length > 0) {
    for (const level of levels) {
      await tx.frameworkLevel.create({
        data: {
          frameworkId,
          levelId: level.id,
          description: level.description,
        },
      });
    }
  }

  for (const pillar of pillars) {
    if (!pillar || !pillar.id) continue;

    const pillarFramework = await tx.pillarFramework.create({
      data: {
        pillarId: pillar.id,
        frameworkId,
        weightWithinDimension: pillar.weightDimension / 100,
      },
    });

    for (const aspect of pillar.aspects || []) {
      if (!aspect.id) continue;

      const createdAspectPillarFramework = await tx.aspectPillarFramework.create({
        data: {
          aspectId: aspect.id,
          pillarFrameworkId: pillarFramework.id,
          weightWithinDimension: aspect.weightDimension / 100,
        },
      });

      for (const level of aspect.levels || []) {
        await tx.aspectPillarFrameworkLevel.create({
          data: {
            aspectPillarFrameworkId: createdAspectPillarFramework.id,
            levelId: level.id,
            description: level.description,
          },
        });
      }
    }
  }
};
