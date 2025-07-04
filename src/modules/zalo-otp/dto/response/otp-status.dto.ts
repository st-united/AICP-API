import { ApiProperty } from '@nestjs/swagger';

export class OtpStatusDto {
  @ApiProperty({
    description: 'Whether OTP is active for the phone number',
    example: true,
  })
  otpActive: boolean;
}
