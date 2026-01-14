import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, IsNotEmpty } from 'class-validator';
import { CompetencyPillarDto } from '../response/competency-pillar.dto';
import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { Transform } from 'class-transformer';

export class CreateCompetencyFrameworkDto {
  @ApiProperty({ example: 'AI Framework' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: { id: 'd4f5e6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90' } })
  @IsObject()
  @IsOptional()
  domain?: DomainDto;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      name: 'Mindset',
      dimension: 'MINDSET',
      weightDimension: 50,
      aspects: [
        {
          name: 'Tư duy phản biện',
          description: 'Đánh giá và phản biện kết quả AI',
          dimension: 'MINDSET',
          weightDimension: 100,
        },
      ],
    },
  })
  mindset?: CompetencyPillarDto;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      name: 'Skillset',
      dimension: 'SKILLSET',
      weightDimension: 50,
      aspects: [
        {
          name: 'Tư duy phản biện',
          description: 'Đánh giá và phản biện kết quả AI',
          dimension: 'SKILLSET',
          weightDimension: 100,
        },
      ],
    },
  })
  skillset?: CompetencyPillarDto;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      name: 'Toolset',
      dimension: 'TOOLSET',
      weightDimension: 50,
      aspects: [
        {
          name: 'Tư duy phản biện',
          description: 'Đánh giá và phản biện kết quả AI',
          dimension: 'TOOLSET',
          weightDimension: 100,
          assessmentMethods: [
            {
              id: '36812a1d-2357-49f8-bc0f-3d78bdb46746',
              weightWithinDimension: 100,
            },
          ],
        },
      ],
    },
  })
  toolset?: CompetencyPillarDto;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === true || value === false) return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive: boolean;
}

export class UpdateCompetencyFrameworkDto extends CreateCompetencyFrameworkDto {}
