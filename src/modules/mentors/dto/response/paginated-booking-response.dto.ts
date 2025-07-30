import { MentorBookingResponseDto } from './mentor-booking-response.dto';

export class PaginatedMentorBookingResponseDto {
  data: MentorBookingResponseDto[];
  total: number;
}
