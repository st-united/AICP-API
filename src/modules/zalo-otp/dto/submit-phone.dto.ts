import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class SubmitPhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must be in E.164 format, e.g. +84901234567' })
  phone: string;
}
