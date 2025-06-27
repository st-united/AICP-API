import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class SubmitPhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(84|0[3|5|7|8|9])+([0-9]{8})$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phoneNumber: string;
}
