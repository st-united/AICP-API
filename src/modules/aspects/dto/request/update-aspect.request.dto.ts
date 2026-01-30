import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAspectAssessmentMethodDto {
  @ApiPropertyOptional({ example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1' })
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ example: 0.5 })
  @IsNumber()
  @Min(0)
  @Max(1)
  weightWithinDimension: number;
}

export class UpdateAspectRequestDto {
  @ApiPropertyOptional({ example: 'Communication Skill' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '7e4fae69-02d8-4b54-bb3f-c6ec1c854b12' })
  @IsOptional()
  @IsUUID()
  pillarId?: string;

  @ApiPropertyOptional({ example: 'Description of the aspect' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [UpdateAspectAssessmentMethodDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAspectAssessmentMethodDto)
  assessmentMethods?: UpdateAspectAssessmentMethodDto[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}
