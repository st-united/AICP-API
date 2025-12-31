import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

export class DomainDto {
  @Expose()
  @ApiProperty({ description: 'Domain ID' })
  @IsString()
  id: string;

  @Expose()
  @ApiProperty({ description: 'Domain name' })
  @IsString()
  name: string;

  @Expose()
  @ApiProperty({ description: 'Domain description' })
  @IsString()
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Domain status' })
  @IsBoolean()
  isActive?: boolean;
}
