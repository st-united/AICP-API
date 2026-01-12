import { PageOptionsDto } from '@app/common/dtos';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ParseBooleanLike } from '@app/common/decorator/transform/parseBooleanLike';

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
    required: false,
  })
  @IsOptional()
  @ParseBooleanLike()
  @IsBoolean()
  isActive?: boolean;
}
