import { IsOptional, IsBoolean } from 'class-validator';
import { PageOptionsDto } from '@app/common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class GetMentorsDto extends PageOptionsDto {
  @ApiProperty({ description: 'Filter by status', required: false })
  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
  })
  isActive?: boolean;
}
