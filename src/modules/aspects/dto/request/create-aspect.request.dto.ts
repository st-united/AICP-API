import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssessmentMethodRequestDto {
  @ApiProperty({
    description: 'Assessment Method ID',
    example: '7e4fae69-02d8-4b54-bb3f-c6ec1c854b12',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Assessment Method Weight',
    example: 1.0,
  })
  @IsNotEmpty()
  @IsNumber()
  weightWithinDimension: number;
}

export class CreateAspectRequestDto {
  @ApiProperty({
    description: 'Aspect Name',
    example: 'AI Ethics & Governance',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Pillar ID',
    example: '7e4fae69-02d8-4b54-bb3f-c6ec1c854b12',
  })
  @IsNotEmpty()
  @IsUUID()
  pillarId: string;

  @ApiProperty({
    description: 'Assessment Methods for this aspect',
    type: [CreateAssessmentMethodRequestDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentMethodRequestDto)
  assessmentMethods?: CreateAssessmentMethodRequestDto[];

  @ApiProperty({
    description: 'Whether to save as draft',
    example: false,
  })
  @IsBoolean()
  isDraft: boolean;
}
