import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateUniversityDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the university', example: 'Harvard University', required: true })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The unique code of the university', example: 'HARVARD', required: true })
  code: string;
}
