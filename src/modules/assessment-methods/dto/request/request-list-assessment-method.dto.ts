import { PageOptionsDto } from '@app/common/dtos';
import { IsOptional, IsString, IsBooleanString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestListAssessmentMethodDto extends PageOptionsDto {
  @ApiProperty({
    description: 'Filter by assessment method name',
    example: 'Self Assessment',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filter by status (active or inactive)',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  isActive?: 'true' | 'false';
}
