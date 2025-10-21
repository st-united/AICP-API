import { Expose, Type } from 'class-transformer';

export class NoteDto {
  @Expose()
  strongPoints?: string;

  @Expose()
  weakness?: string;

  @Expose()
  improvementPoints?: string;
}

export class AspectSuggestDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class AspectDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  represent: string;

  @Expose()
  weightWithinDimension: number;

  @Expose()
  score?: number;

  @Expose()
  @Type(() => NoteDto)
  note?: NoteDto;

  @Expose()
  @Type(() => AspectSuggestDto)
  miningSuggest: AspectSuggestDto[];

  @Expose()
  @Type(() => AspectSuggestDto)
  assessmentGuide: AspectSuggestDto[];
}

export class PillarDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => Number)
  weightWithinDimension: number;

  @Expose()
  @Type(() => AspectDto)
  aspects: AspectDto[];
}

export class AspectExvaluationDto {
  @Expose()
  id: string;

  @Expose()
  progress: number = 0;

  @Expose()
  isDraft: boolean;

  @Expose()
  score?: number;

  @Expose()
  @Type(() => PillarDto)
  mindset?: PillarDto;

  @Expose()
  @Type(() => PillarDto)
  skillset?: PillarDto;

  @Expose()
  @Type(() => PillarDto)
  toolset?: PillarDto;
}
