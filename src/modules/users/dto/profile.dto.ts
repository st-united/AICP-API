import { Expose } from 'class-transformer';

export class ProfileDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  provider?: string;

  @Expose()
  status?: boolean;

  @Expose()
  dob?: Date;

  @Expose()
  country?: string;

  @Expose()
  province?: string;

  @Expose()
  job?: string;

  @Expose()
  referralCode?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  deletedAt?: Date;

  @Expose()
  roles?: RoleDto[];
}

class RoleDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
}
