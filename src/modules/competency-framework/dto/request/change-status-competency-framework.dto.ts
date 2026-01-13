import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ChangeStatusCompetencyFrameworkDto {
  @IsOptional()
  @ApiProperty({ example: true, description: 'Trạng thái phát hành' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  })
  isActive?: boolean;
}
