import { PartialType } from '@nestjs/swagger';
import { UpsertMentorScheduleWithSpotsDto } from './upsert-mentor-schedule-with-spots.dto';
export class UpdateMentorScheduleDto extends PartialType(UpsertMentorScheduleWithSpotsDto) {}
