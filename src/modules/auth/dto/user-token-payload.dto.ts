export class UserTokenPayloadDto {
  id: string;
  email: string;
  fullName: string;
  refreshToken?: string;
}
