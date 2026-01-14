import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class ChangeStatusCompetencyFrameworkDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Trạng thái phát hành' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive: boolean;
}
