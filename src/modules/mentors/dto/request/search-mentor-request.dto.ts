import { PageOptionsDto } from '@app/common/dtos';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class SearchMentorRequestDto extends PageOptionsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  })
  status?: boolean;
}
