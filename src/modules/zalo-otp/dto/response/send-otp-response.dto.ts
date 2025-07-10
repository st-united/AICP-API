import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SendOtpResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Whether OTP was sent successfully',
    example: true,
  })
  success: boolean;
}
