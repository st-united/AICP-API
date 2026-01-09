import { PageOptionsDto } from '@app/common/dtos';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ParseBooleanLike } from '@app/common/decorator/transform/parseBooleanLike';

export class RequestListAssessmentMethodDto extends PageOptionsDto {
  @ApiProperty({
    description: 'Filter by status true false',
    example: 'true',
    required: false,
  })
  @IsOptional()
  @ParseBooleanLike()
  @IsBoolean()
  isActive?: boolean;
}
