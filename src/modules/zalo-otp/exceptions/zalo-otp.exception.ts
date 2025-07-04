import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

export class ZaloOtpException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class ZaloApiException extends InternalServerErrorException {
  constructor(message: string) {
    super(`Zalo API Error: ${message}`);
  }
}

export class OtpRateLimitException extends BadRequestException {
  constructor() {
    super('Bạn chỉ được gửi lại OTP sau 5 phút.');
  }
}

export class OtpExpiredException extends BadRequestException {
  constructor() {
    super('OTP không tồn tại hoặc đã hết hạn');
  }
}

export class OtpInvalidException extends BadRequestException {
  constructor() {
    super('OTP không đúng');
  }
}
