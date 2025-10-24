import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class University {
  @IsUUID()
  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the university',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  id?: string;

  @IsString()
  @Expose()
  @ApiProperty({
    description: 'The name of the university',
    example: 'Harvard University',
    required: false,
  })
  @IsOptional()
  name?: string;

  @IsString()
  @Expose()
  @ApiProperty({
    description: 'The unique code of the university',
    example: 'HARVARD',
    required: false,
  })
  @IsOptional()
  code?: string;
}
