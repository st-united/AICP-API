import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';
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
  @ApiProperty({ description: 'is user is student', required: false })
  @IsOptional()
  @IsString()
  isStudent?: string;

  @ApiProperty({ description: 'user university', required: false })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiProperty({ description: 'stundent code', required: false })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiProperty({ description: 'LinkedIn profile URL', required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedInUrl?: string;

  @ApiProperty({ description: 'GitHub profile URL', required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubUrl?: string;

  @ApiProperty({
    description: 'Certifications',
    required: false,
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  certificateFiles?: Express.Multer.File[];

  @ApiProperty({
    description: 'Experiences',
    required: false,
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  experienceFiles?: Express.Multer.File[];

  @ApiProperty({ description: 'Deleted Certifications', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(transformArray)
  deleted_certifications?: string[];

  @ApiProperty({ description: 'Deleted Experiences', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(transformArray)
  deleted_experiences?: string[];
}
