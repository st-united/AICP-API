import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '@app/common/dtos';
import { StatusEnum } from '@app/common/constants';
import { Transform } from 'class-transformer';

export class SearchCompetencyFrameworkRequestDto extends PageOptionsDto {
  @IsOptional()
  @ApiProperty({ example: true, description: 'Status competency framework' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  })
  status?: boolean;
}
