import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class ResponseAssessmentMethodDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'assessment-method-123',
    description: 'ID of the assessment method',
  })
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'assessment method 123',
    description: 'Name of the assessment method',
  })
  name: string;

  @Expose()
  @IsEmpty()
  @IsString()
  @ApiProperty({
    example: 'This is description of assessment method for user',
    description: 'Description of the assessment method',
  })
  description: string;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Indicates if the assessment method is active',
  })
  isActive: boolean;
}
