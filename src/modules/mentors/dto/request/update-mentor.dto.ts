import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateMentorDto } from './create-mentor.dto';
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateMentorDto extends PartialType(OmitType(CreateMentorDto, ['role'])) {
  @Expose()
  @ApiProperty({
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
