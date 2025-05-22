import { PageOptionsDto } from '@app/common/dtos';
import { Expose } from 'class-transformer';

export class GetMenteesDto extends PageOptionsDto {
  @Expose()
  mentorId: string;
}
