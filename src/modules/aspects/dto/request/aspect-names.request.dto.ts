import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsArray } from 'class-validator';
import { CompetencyAspectStatus } from '@prisma/client';
import { ParseArrayLike } from '@app/common/decorator/transform/parseArrayLike';

export class AspectNamesRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by pillar dimension',
    example: '7e4fae69-02d8-4b54-bb3f-c6ec1c854b12',
  })
  @IsOptional()
  @IsUUID()
  pillarId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (DRAFT, AVAILABLE, REFERENCED)',
    enum: CompetencyAspectStatus,
    isArray: true,
    example: [CompetencyAspectStatus.DRAFT, CompetencyAspectStatus.AVAILABLE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CompetencyAspectStatus, { each: true })
  @ParseArrayLike()
  status?: CompetencyAspectStatus[];
}
