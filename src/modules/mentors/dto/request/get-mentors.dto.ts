import { IsOptional, IsBoolean } from 'class-validator';
import { PageOptionsDto } from '@app/common/dtos';

export class GetMentorsDto extends PageOptionsDto {
  @IsOptional()
  @IsBoolean()
  status: boolean;
}
