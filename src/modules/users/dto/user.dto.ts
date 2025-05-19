export class UserDto {
  email: string;

  phoneNumber: string;

  fullName: string;

  avatarUrl?: string;

  provider?: string;

  status: boolean;

  dob: Date;

  country: string;

  province: string;

  job: string;

  referralCode: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date;
}
