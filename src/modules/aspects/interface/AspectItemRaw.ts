import { CompetencyAspectStatus } from '@prisma/client';

export interface AspectItemRaw {
  id: string;
  name: string;
  pillar_id: string;
  created_at: Date;
  status: CompetencyAspectStatus;
  assessment_methods: AssessmentMethodItemRaw[];
}

export interface AssessmentMethodItemRaw {
  id: string;
  name: string;
  weight_within_dimension: number;
}
