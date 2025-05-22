import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateStatusSubmitDto {
  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  timeStart: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  timeEnd: string;
}
