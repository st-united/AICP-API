import { MentorBookingResponseDto } from './mentor-booking-response.dto';

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
}
