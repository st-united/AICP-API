import { CompetencyAspectStatus } from '@prisma/client';
import { UUID } from 'node:crypto';

export interface AspectItemRaw {
  id: UUID;
  name: string;
  pillar_id: UUID;
  created_at: Date;
  status: CompetencyAspectStatus;
  assessment_methods: AssessmentMethodItemRaw[];
}

export interface AssessmentMethodItemRaw {
  id: UUID;
  name: string;
  weight_within_dimension: number;
}
