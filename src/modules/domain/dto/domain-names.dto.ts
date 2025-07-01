import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class DomainNamesDto {
  @Expose()
  @ApiProperty({ description: 'Domain ID' })
  @IsString()
  id: string;

  @Expose()
  @ApiProperty({ description: 'Domain name' })
  @IsString()
  name: string;
}
