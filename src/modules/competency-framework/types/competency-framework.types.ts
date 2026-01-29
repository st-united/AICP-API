import { CompetencyAspectStatus, Prisma } from '@prisma/client';

export const competencyFrameworkSelect = {
  id: true,
  name: true,
  isActive: true,
  domain: {
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  pillarFrameworks: {
    select: {
      id: true,
      weightWithinDimension: true,
      pillar: {
        select: {
          id: true,
          name: true,
          dimension: true,
        },
      },
      aspectPillarFrameworks: {
        where: {
          aspect: {
            status: {
              not: CompetencyAspectStatus.DRAFT,
            },
          },
        },
        select: {
          id: true,
          weightWithinDimension: true,
          aspect: {
            select: {
              id: true,
              name: true,
              description: true,
              represent: true,
              dimension: true,
            },
          },
          levels: {
            select: {
              id: true,
              description: true,
              levelId: true,
              level: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
  frameworkLevels: {
    select: {
      id: true,
      description: true,
      levelId: true,
      level: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

export type CompetencyFrameworkPayload = Prisma.CompetencyFrameworkGetPayload<{
  select: typeof competencyFrameworkSelect;
}>;

export type PillarFrameworkPayload = CompetencyFrameworkPayload['pillarFrameworks'][number];
export type AspectPillarFrameworkPayload = PillarFrameworkPayload['aspectPillarFrameworks'][number];
export type AspectPillarFrameworkLevelPayload = AspectPillarFrameworkPayload['levels'][number];
export type FrameworkLevelPayload = CompetencyFrameworkPayload['frameworkLevels'][number];
