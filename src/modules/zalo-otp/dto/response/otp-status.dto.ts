import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class OtpStatusDto {
  @Expose()
  @ApiProperty({
    description: 'Số điện thoại',
    example: '+84901234567',
  })
  @IsNumber()
  phoneNumber: string;

  @Expose()
  @ApiProperty({
    description: 'Trạng thái xác thực Zalo',
    example: false,
  })
  zaloVerified: boolean;
}
