import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateUniversityDto {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the university', example: 'Harvard University' })
  code: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({ description: 'The unique code of the university', example: 'HARVARD' })
  name: string;
}
