import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpResponseDto {
  @ApiProperty({
    description: 'Whether OTP verification was successful',
    example: true,
  })
  verified: boolean;
}
