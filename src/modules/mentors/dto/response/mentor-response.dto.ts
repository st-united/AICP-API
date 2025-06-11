// mentor-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '@UsersModule/dto/response/user-response.dto';
import { $Enums, Mentor } from '@prisma/client';

export class MentorResponseDto implements Mentor {
  sfiaLevel: $Enums.SFIALevel;
  maxMentees: number;
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  expertise: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  user?: UserResponseDto;
}
