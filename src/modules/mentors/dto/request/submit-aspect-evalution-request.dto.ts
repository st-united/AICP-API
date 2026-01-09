import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NoteDto } from '../response/aspect-exvaluation.dto';

export class AspectDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  score?: number;

  @IsOptional()
  @Type(() => NoteDto)
  @IsNotEmpty()
  note?: NoteDto;
}

export class PillarDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @Type(() => AspectDto)
  aspects: AspectDto[];
}

export class SubmitAspectExvaluationRequestDto {
  @IsBoolean()
  @IsNotEmpty()
  isDraft: boolean;

  @IsNotEmpty()
  @Type(() => PillarDto)
  mindset: PillarDto;

  @IsNotEmpty()
  @Type(() => PillarDto)
  skillset: PillarDto;

  @IsNotEmpty()
  @Type(() => PillarDto)
  toolset: PillarDto;
}
