import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VerifyOtpResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Whether OTP verification was successful',
    example: true,
  })
  verified: boolean;
}
