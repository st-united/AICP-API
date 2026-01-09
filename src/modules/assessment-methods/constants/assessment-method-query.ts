import { Prisma } from '@prisma/client';

export const ASSESSMENT_METHOD_CTE_NAMES = {
  ASSESSMENT_METHOD: 'assessment_method',
} as const;

export const ASSESSMENT_METHOD_TABLES = {
  ASSESSMENT_METHOD: {
    table: Prisma.raw(`"AssessmentMethod" ${ASSESSMENT_METHOD_CTE_NAMES.ASSESSMENT_METHOD}`),
    id: Prisma.raw(`${ASSESSMENT_METHOD_CTE_NAMES.ASSESSMENT_METHOD}."id"`),
    name: Prisma.raw(`${ASSESSMENT_METHOD_CTE_NAMES.ASSESSMENT_METHOD}."name"`),
    description: Prisma.raw(`${ASSESSMENT_METHOD_CTE_NAMES.ASSESSMENT_METHOD}."description"`),
    isActive: Prisma.raw(`${ASSESSMENT_METHOD_CTE_NAMES.ASSESSMENT_METHOD}."is_active"`),
    createdAt: Prisma.raw(`${ASSESSMENT_METHOD_CTE_NAMES.ASSESSMENT_METHOD}."created_at"`),
    updatedAt: Prisma.raw(`${ASSESSMENT_METHOD_CTE_NAMES.ASSESSMENT_METHOD}."updated_at"`),
  },
};
