import { Prisma } from '@prisma/client';

// CTE Name Strings
export const CTE_NAMES = {
  COMPUTED_STATUS: 'computed_status',
  HAS_ASSESSMENT_METHOD: 'has_assessment_method',
  HAS_ASSESSMENT_PILLAR: 'has_assessment_pillar',
  ASPECT_DATA: 'aspect_data',
  ASPECT_WITH_STATUS: 'aspect_with_status',
  ASSESSMENT_METHODS: 'assessment_methods',
  COMPETENCY_ASPECT: 'competency_aspect',
} as const;

// CTE Raw Objects
export const CTE = {
  COMPUTED_STATUS: Prisma.raw(CTE_NAMES.COMPUTED_STATUS),
  HAS_ASSESSMENT_METHOD: Prisma.raw(CTE_NAMES.HAS_ASSESSMENT_METHOD),
  HAS_ASSESSMENT_PILLAR: Prisma.raw(CTE_NAMES.HAS_ASSESSMENT_PILLAR),
  ASPECT_DATA: Prisma.raw(CTE_NAMES.ASPECT_DATA),
  ASPECT_WITH_STATUS: Prisma.raw(CTE_NAMES.ASPECT_WITH_STATUS),
  ASSESSMENT_METHODS: Prisma.raw(CTE_NAMES.ASSESSMENT_METHODS),
  COMPETENCY_ASPECT: Prisma.raw(CTE_NAMES.COMPETENCY_ASPECT),
};

export const ASPECT_TABLES = {
  ASPECT: {
    // When alias is used in FROM clause
    table: Prisma.raw(`"${Prisma.ModelName.CompetencyAspect}" ${CTE_NAMES.COMPETENCY_ASPECT}`),
    // Column references
    id: Prisma.raw(`${CTE_NAMES.COMPETENCY_ASPECT}."id"`),
    name: Prisma.raw(`${CTE_NAMES.COMPETENCY_ASPECT}."name"`),
    pillarId: Prisma.raw(`${CTE_NAMES.COMPETENCY_ASPECT}."pillar_id"`),
    createdAt: Prisma.raw(`${CTE_NAMES.COMPETENCY_ASPECT}."created_at"`),
    status: Prisma.raw(`${CTE_NAMES.COMPETENCY_ASPECT}."status"`),
    assessmentMethods: Prisma.raw(`${CTE_NAMES.COMPETENCY_ASPECT}."assessment_methods"`),
  },
  ASPECT_ASSESSMENT_METHOD: {
    table: Prisma.raw(`"${Prisma.ModelName.CompetencyAspectAssessmentMethod}" competency_aspect_assessment_method`),
    competencyAspectId: Prisma.raw(`competency_aspect_assessment_method."competency_aspect_id"`),
    assessmentMethodId: Prisma.raw(`competency_aspect_assessment_method."assessment_method_id"`),
    weightWithinDimension: Prisma.raw(`competency_aspect_assessment_method."weight_within_dimension"`),
  },
  ASPECT_PILLAR: {
    table: Prisma.raw(`"${Prisma.ModelName.AspectPillarFramework}" aspect_pillar`),
    pillarId: Prisma.raw(`aspect_pillar."pillar_id"`),
    aspectId: Prisma.raw(`aspect_pillar."aspect_id"`),
  },
  PILLAR_FRAMEWORK: {
    table: Prisma.raw(`"${Prisma.ModelName.PillarFramework}" pillar_framework`),
    pillarId: Prisma.raw(`pillar_framework."pillar_id"`),
  },
  ASSESSMENT_METHOD: {
    table: Prisma.raw(`"${Prisma.ModelName.AssessmentMethod}" assessment_method`),
    id: Prisma.raw(`assessment_method."id"`),
    name: Prisma.raw(`assessment_method."name"`),
  },
};
