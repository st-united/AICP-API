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

  @ApiProperty({ example: 'd4f5e6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90' })
  @IsObject()
  @IsOptional()
  domain?: DomainDto;

  @IsOptional()
  mindset?: CompetencyPillarDto;

  @IsOptional()
  skillset?: CompetencyPillarDto;

  @IsOptional()
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
