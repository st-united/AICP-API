import { CompetencyDimension } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AspectDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  represent: string;

  @Expose()
  dimension: CompetencyDimension;
}
