import { BadRequestException } from '@nestjs/common';
import { CompetencyDimension, Prisma } from '@prisma/client';
import { CompetencyPillarDto } from '../dto/response/competency-pillar.dto';

const pillarPrefixByDimension: Record<CompetencyDimension, string> = {
  [CompetencyDimension.MINDSET]: 'A',
  [CompetencyDimension.SKILLSET]: 'B',
  [CompetencyDimension.TOOLSET]: 'C',
};

const getPillarPrefix = (dimension: CompetencyDimension): string => pillarPrefixByDimension[dimension];

export const persistPillars = async (
  tx: Prisma.TransactionClient,
  frameworkId: string,
  pillars: Array<CompetencyPillarDto | undefined>
): Promise<void> => {
  for (const pillar of pillars) {
    if (!pillar) continue;
    const createdPillar = await tx.competencyPillar.create({
      data: {
        name: pillar.name,
        dimension: pillar.dimension,
        frameworkId,
        weightWithinDimension: pillar.weightDimension / 100,
      },
    });
    for (const [index, aspect] of (pillar.aspects || []).entries()) {
      const createdAspect = await tx.competencyAspect.create({
        data: {
          name: aspect.name,
          pillarId: createdPillar.id,
          description: aspect.description,
          represent: `${getPillarPrefix(pillar.dimension)}${index + 1}`,
          weightWithinDimension: aspect.weightDimension / 100,
          dimension: pillar.dimension,
        },
      });
      for (const method of aspect.assessmentMethods || []) {
        if (!method?.id) {
          throw new BadRequestException('Phương pháp đánh giá không hợp lệ');
        }
        await tx.competencyAspectAssessmentMethod.create({
          data: {
            competencyAspectId: createdAspect.id,
            assessmentMethodId: method.id,
            weightWithinDimension: ((method as { weightWithinDimension?: number }).weightWithinDimension ?? 0) / 100,
          },
        });
      }
    }
  }
};
