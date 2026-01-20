import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class University {
  @IsUUID()
  @Expose()
  @ApiProperty()
  id: string;

  @IsString()
  @Expose()
  @ApiProperty()
  name: string;

  @IsString()
  @Expose()
  @ApiProperty()
  code: string;
}
