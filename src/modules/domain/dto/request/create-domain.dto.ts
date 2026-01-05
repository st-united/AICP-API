import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';

export class CreateDomainDto extends PickType(DomainDto, ['name', 'description'] as const) {
  @ApiProperty({ required: true, description: 'Domain name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false, description: 'Domain description' })
  @IsOptional()
  @IsString()
  description?: string;
}
