import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CanSendOtpResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Có thể gửi OTP hay không',
    example: true,
  })
  canSend: boolean;

  @Expose()
  @ApiProperty({
    description: 'Thời gian còn lại để có thể gửi OTP (giây)',
    example: 180,
    required: false,
  })
  remainingSeconds?: number;

  @Expose()
  @ApiProperty({
    description: 'Thời gian có thể gửi OTP tiếp theo (timestamp)',
    example: 1640995200000,
    required: false,
  })
  nextSendTime?: number;
}
