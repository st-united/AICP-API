import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateDomainStatusDto {
  @ApiProperty({ description: 'Domain status', example: true })
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  status: boolean;
}
