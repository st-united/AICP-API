import { Expose, Type } from 'class-transformer';

export class AvailableMentorUserDto {
  @Expose()
  id: string;

  @Expose()
  fullName?: string;

  @Expose()
  email?: string;

  @Expose()
  avatarUrl?: string;
}

export class AvailableMentorResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId?: string;

  @Expose()
  expertise?: string;

  @Expose()
  isActive?: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  fullName?: string;

  @Expose()
  email?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  @Type(() => AvailableMentorUserDto)
  user?: AvailableMentorUserDto;
}
