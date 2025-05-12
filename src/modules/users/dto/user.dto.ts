export class UserDto {
  email: string;

  fullName: string;

  avatarUrl?: string;

  provider?: string;

  status: boolean;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date;
}
