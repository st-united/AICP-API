import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsUrl } from 'class-validator';

export class GetPortfolioResponseDto {
  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedInUrl?: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubUrl?: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  portfolioUrl?: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  developmentFocusAnswer?: string;

  @Expose()
  @ApiProperty({ type: [String], description: 'Array of certification file URLs' })
  @IsOptional()
  @IsArray()
  certificateFiles: string[];

  @Expose()
  @ApiProperty({ type: [String], description: 'Array of experience file URLs' })
  @IsOptional()
  @IsArray()
  experienceFiles: string[];
}
