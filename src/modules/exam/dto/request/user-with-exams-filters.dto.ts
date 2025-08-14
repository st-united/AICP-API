import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UsersWithExamsFilters {
  @Expose()
  @ApiProperty()
  fromDate?: Date;

  @Expose()
  @ApiProperty()
  toDate?: Date;

  @Expose()
  @ApiProperty()
  university?: string;
}
