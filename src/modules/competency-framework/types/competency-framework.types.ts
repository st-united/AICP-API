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
      isActice: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  pillars: {
    select: {
      id: true,
      weightWithinDimension: true,
      pillar: {
        select: {
          id: true,
          name: true,
          dimension: true,
          aspectPillars: {
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
  frameworkAssessments: {
    select: {
      id: true,
      weightWithinFramework: true,
      assessmentMethod: {
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

export type PillarFrameworkPayload = CompetencyFrameworkPayload['pillars'][number];
export type AspectPillarPayload = PillarFrameworkPayload['pillar']['aspectPillars'][number];
export type AspectPillarLevelPayload = AspectPillarPayload['levels'][number];
export type FrameworkLevelPayload = CompetencyFrameworkPayload['levels'][number];
