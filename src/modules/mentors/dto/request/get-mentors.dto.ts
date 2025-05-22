import { IsOptional, IsBoolean } from 'class-validator';
import { PageOptionsDto } from '@app/common/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMentorsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Filter by status', default: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
