import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

const transformArray = ({ value }) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return value;
};

export class UpdatePortfolioDto {
  @ApiProperty({ description: 'LinkedIn profile URL', required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedInUrl?: string;

  @ApiProperty({ description: 'GitHub profile URL', required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubUrl?: string;

  @ApiProperty({ description: 'Certification file URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(transformArray)
  certificateFiles?: string[];

  @ApiProperty({ description: 'Experience file URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(transformArray)
  experienceFiles?: string[];
}
