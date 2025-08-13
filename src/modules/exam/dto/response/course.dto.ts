import { ApiProperty } from '@nestjs/swagger';
import { SFIALevel } from '@prisma/client';

export class CourseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false })
  linkImage?: string | null;

  @ApiProperty({ required: false, default: 'ONLINE' })
  courseType?: string;

  @ApiProperty({ required: false })
  durationHours?: number;

  @ApiProperty({ enum: SFIALevel, required: false })
  difficultyLevel?: SFIALevel;

  @ApiProperty()
  aspectId: string;

  @ApiProperty({ required: false })
  domainId?: string;

  @ApiProperty({ isArray: true, enum: SFIALevel })
  sfiaLevels: SFIALevel[];

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isRegistered: boolean;
}
