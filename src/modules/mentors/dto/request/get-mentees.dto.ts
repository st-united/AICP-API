import { PageOptionsDto } from '@app/common/dtos';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetMenteesDto extends PageOptionsDto {
  @Expose()
  @ApiProperty({ description: 'Mentor ID' })
  @IsUUID()
  mentorId: string;
}
