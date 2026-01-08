import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MentorSpotStatus } from '@Constant/enums';

class TimeRangeDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'start phải có format HH:mm' })
  start: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'end phải có format HH:mm' })
  end: string;
}

class AvailabilityDayDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date phải có format YYYY-MM-DD' })
  date: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  ranges: TimeRangeDto[];
}

export class CreateMentorSlotsDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsInt()
  @IsIn([15, 30, 45, 60])
  durationMin: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDayDto)
  availabilities: AvailabilityDayDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  bufferMinutes?: number = 0;

  @IsOptional()
  @IsString()
  @IsIn([MentorSpotStatus.AVAILABLE, MentorSpotStatus.HELD])
  defaultStatus?: MentorSpotStatus = MentorSpotStatus.AVAILABLE;

  @IsOptional()
  @IsString()
  @IsIn(['SKIP', 'REPLACE', 'ERROR'])
  conflictPolicy?: 'SKIP' | 'REPLACE' | 'ERROR' = 'SKIP';
}
