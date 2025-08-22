import { ApiProperty } from '@nestjs/swagger';

export class FrameworkDto {
  @ApiProperty({ example: 'AI Competency Framework' })
  name: string;

  @ApiProperty({ example: '5.0' })
  version: string;
}

export class ExamSetResponseDto {
  @ApiProperty({ example: 'ef2eae94-6631-4716-b6bb-6ac3e9e2e943' })
  id: string;

  @ApiProperty({ example: 'AI Tools and Applications' })
  name: string;

  @ApiProperty({ example: 'https://example.com/image.png' })
  urlImage: string;

  @ApiProperty({ example: 'Assessment of practical AI tools and applications knowledge' })
  description: string;

  @ApiProperty({ example: '2025-07-22T08:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2025-07-24T08:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: 'DRAFT' })
  status: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-07-20T10:00:00.000Z' })
  createdAt: Date;
}
