import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SpotsByDayDto, SimpleRangeDto } from './spot-item.dto';

class MentorUserBriefDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() fullName!: string;
  @ApiProperty() @Expose() email!: string;
  @ApiProperty({ required: false, nullable: true }) @Expose() avatarUrl?: string | null;
}

class MentorBriefDto {
  @ApiProperty() @Expose() id!: string;
  @ApiProperty() @Expose() expertise!: string;

  @ApiProperty({ type: MentorUserBriefDto })
  @Expose()
  @Type(() => MentorUserBriefDto)
  user!: MentorUserBriefDto;
}

export class MentorWithDaysDto {
  @ApiProperty({ type: MentorBriefDto })
  @Expose()
  @Type(() => MentorBriefDto)
  mentor!: MentorBriefDto;

  @ApiProperty({ type: [SpotsByDayDto] })
  @Expose()
  @Type(() => SpotsByDayDto)
  days!: SpotsByDayDto[];
}

export class PaginationMentorDto {
  @ApiProperty({ example: 1 }) @Expose() page!: number;
  @ApiProperty({ example: 10 }) @Expose() pageSize!: number;
  @ApiProperty({ example: 42 }) @Expose() totalMentors!: number;
}

export class GetAllMentorSpotsResponseDto {
  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' }) @Expose() timezone!: string;

  @ApiProperty({ type: SimpleRangeDto })
  @Expose()
  @Type(() => SimpleRangeDto)
  range!: SimpleRangeDto;

  @ApiProperty({ type: PaginationMentorDto })
  @Expose()
  @Type(() => PaginationMentorDto)
  pagination!: PaginationMentorDto;

  @ApiProperty({ type: [MentorWithDaysDto] })
  @Expose()
  @Type(() => MentorWithDaysDto)
  mentors!: MentorWithDaysDto[];
}
