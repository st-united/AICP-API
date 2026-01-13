import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MutateAssessmentMethodDto {
  @ApiProperty({
    description: 'Assessment method name',
    example: 'Self Assessment',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Assessment method description',
    example: 'Individual self-evaluation of competencies',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
