import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class SubmitPhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+][1-9]\d{1,14}$/, { message: 'Số điện thoại phải theo định dạng E.164, ví dụ: +84901234567' })
  phone: string;
}
