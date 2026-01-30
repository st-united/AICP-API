import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompetencyAspectStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '@app/common/dtos';
import { IsUUID } from 'class-validator';

export class AspectListRequestDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: 'Filter by pillar',
    example: '7e4fae69-02d8-4b54-bb3f-c6ec1c854b12',
  })
  @IsOptional()
  @IsUUID()
  pillarId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (DRAFT, AVAILABLE, REFERENCED)',
    enum: CompetencyAspectStatus,
    example: CompetencyAspectStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(CompetencyAspectStatus)
  status?: CompetencyAspectStatus;

  @ApiPropertyOptional({
    description: 'Filter by assessment method id',
  })
  @IsOptional()
  @IsUUID()
  assessmentMethodId?: string;
}
