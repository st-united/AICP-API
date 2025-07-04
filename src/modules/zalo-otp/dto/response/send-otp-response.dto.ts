import { ApiProperty } from '@nestjs/swagger';

export class SendOtpResponseDto {
  @ApiProperty({
    description: 'Whether OTP was sent successfully',
    example: true,
  })
  success: boolean;
}
