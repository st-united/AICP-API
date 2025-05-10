import { IsOptional } from 'class-validator';

import { PageOptionsDto } from '@app/common/dtos';

export class GetUsersDto extends PageOptionsDto {
  @IsOptional()
  status;
}
