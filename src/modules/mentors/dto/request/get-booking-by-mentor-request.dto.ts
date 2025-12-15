import { PageOptionsDto } from '@app/common/dtos';
import { MentorBookingStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GetBookingByMentorRequestDto extends PageOptionsDto {
  @IsNotEmpty()
  @IsUUID()
  mentorId: string;

  @IsNotEmpty()
  @IsEnum(MentorBookingStatus, { each: true })
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status: MentorBookingStatus[];
}
