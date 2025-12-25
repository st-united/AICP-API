import { Domain, University } from '@prisma/client';
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
  job?: Domain[];

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

  @Expose()
  isStudent?: boolean;

  @Expose()
  university?: University;

  @Expose()
  studentCode?: string;

  @Expose()
  zaloVerified?: boolean;

  @Expose()
  profileCompleted?: boolean;
}

export class UniversityDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;
}

class RoleDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
}
