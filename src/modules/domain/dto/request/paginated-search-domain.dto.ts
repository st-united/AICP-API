import { PageOptionsDto } from '@app/common/dtos';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class PaginatedSearchDomainDto extends PageOptionsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  })
  status?: boolean;
}
