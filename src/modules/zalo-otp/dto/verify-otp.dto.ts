import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otpCode: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
