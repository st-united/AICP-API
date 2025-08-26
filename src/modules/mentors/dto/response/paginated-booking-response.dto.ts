import { MentorBookingResponseDto } from './mentor-booking-response.dto';
import { ValidateNested, IsArray, IsString } from 'class-validator';

export class PaginatedMentorBookingResponseDto {
  data: MentorBookingResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    total: number;
    completed: number;
    upcoming: number;
    notJoined: number;
  };

  @IsArray()
  @IsString({ each: true })
  levels: string[];

  @IsArray()
  @IsString({ each: true })
  statuses: string[];
}
