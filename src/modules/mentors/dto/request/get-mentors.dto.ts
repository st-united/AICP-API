import { IsOptional, IsBoolean } from 'class-validator';
import { PageOptionsDto } from '@app/common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class GetMentorsDto extends PageOptionsDto {
  @ApiProperty({ description: 'Filter by status', required: false })
  @Expose()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status?: boolean;
}
