import { Prisma } from '@prisma/client';

export const competencyFrameworkSelect = {
  id: true,
  name: true,
  isActive: true,
  domain: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  pillars: {
    select: {
      id: true,
      name: true,
      dimension: true,
      weightWithinDimension: true,
      aspects: {
        select: {
          id: true,
          name: true,
          description: true,
          represent: true,
          dimension: true,
          weightWithinDimension: true,
          assessmentMethods: {
            select: {
              weightWithinDimension: true,
              assessmentMethod: {
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
} as const;

export type CompetencyFrameworkPayload = Prisma.CompetencyFrameworkGetPayload<{
  select: typeof competencyFrameworkSelect;
}>;

export type PillarPayload = CompetencyFrameworkPayload['pillars'][number];
export type AspectPayload = PillarPayload['aspects'][number];
export type AssessmentMethodPayload = AspectPayload['assessmentMethods'][number];
