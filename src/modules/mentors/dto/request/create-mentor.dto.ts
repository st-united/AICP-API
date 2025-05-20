import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Prisma } from '@prisma/client';
import { Expose } from 'class-transformer';

export class CreateMentorDto implements Omit<Prisma.MentorCreateInput, 'user'> {
  @Expose()
  @ApiProperty({
    description: 'The user ID of the mentor',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @Expose()
  @ApiProperty({
    description: 'The expertise of the mentor',
    type: String,
    required: false,
    example: 'JavaScript, React, Node.js',
  })
  @IsOptional()
  @IsString()
  expertise?: string;
}
