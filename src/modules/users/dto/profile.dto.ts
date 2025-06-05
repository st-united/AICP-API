import { Expose } from 'class-transformer';

export class ProfileDto {
  @Expose()
  id: string;

  @Expose()
  userName: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  provider?: string;

  @Expose()
  status?: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  deletedAt?: Date;
}
