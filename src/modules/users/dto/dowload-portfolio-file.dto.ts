import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DownloadPortfolioFileDto {
  @ApiProperty({
    description: 'URL of the file to download',
    example: 'https://storage.googleapis.com/portfolio/files/document.pdf',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Name to save the file as',
    example: 'document.pdf',
  })
  @IsNotEmpty()
  @IsString()
  filename: string;
}
