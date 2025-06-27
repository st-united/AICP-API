import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ZaloService } from '../zalo/zalo.service';
import { OtpData } from './interface/zalo-otp.interface';

@Injectable()
export class ZaloOtpService {
  private readonly logger = new Logger(ZaloOtpService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly zaloService: ZaloService
  ) {}

  async submitPhoneNumber(phoneNumber: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const canSubmit = await this.redisService.checkSubmitRateLimit(phoneNumber);
      if (!canSubmit) {
        return {
          success: false,
          message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 5 phút.',
        };
      }

      await this.redisService.savePendingPhone(phoneNumber);

      this.logger.log(`Phone number submitted: ${phoneNumber}`);

      return {
        success: true,
        message: 'Vui lòng tương tác với Zalo OA để nhận mã OTP',
      };
    } catch (error) {
      this.logger.error('Error submitting phone number:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra, vui lòng thử lại',
      };
    }
  }

  async handleZaloInteraction(
    zaloUserId: string,
    userMessage?: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      this.logger.log(`Zalo user interaction: ${zaloUserId}, message: ${userMessage}`);

      let phoneToProcess: string | null = null;

      if (userMessage) {
        const phoneMatch = userMessage.match(/\b(84|0[3|5|7|8|9])+([0-9]{8})\b/);
        if (phoneMatch) {
          phoneToProcess = phoneMatch[0];
        }
      }

      if (!phoneToProcess) {
        return {
          success: false,
          message: 'Vui lòng gửi số điện thoại cần xác thực',
        };
      }

      const pendingPhone = await this.redisService.getPendingPhone(phoneToProcess);
      if (!pendingPhone) {
        return {
          success: false,
          message: 'Số điện thoại này chưa được đăng ký hoặc đã hết hạn',
        };
      }

      const otpCode = this.zaloService.generateOtpCode();
      const now = Date.now();

      const otpData: OtpData = {
        phoneNumber: phoneToProcess,
        zaloUserId,
        otpCode,
        createdAt: now,
        expiresAt: now + 5 * 60 * 1000,
      };

      await this.redisService.saveOtp(phoneToProcess, otpData);

      const sent = await this.zaloService.sendOtpMessage(zaloUserId, otpCode, phoneToProcess);

      if (!sent) {
        this.logger.error('Failed to send OTP via Zalo');
        return { success: false, message: 'Không thể gửi OTP' };
      }

      await this.redisService.clearPendingPhone(phoneToProcess);

      this.logger.log(`OTP created and sent for ${phoneToProcess}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error handling Zalo interaction:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  }

  async verifyOtp(
    phoneNumber: string,
    otpCode: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const canVerify = await this.redisService.checkVerifyRateLimit(phoneNumber);
      if (!canVerify) {
        return {
          success: false,
          message: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 5 phút.',
        };
      }

      const otpData = await this.redisService.getOtp(phoneNumber);

      if (!otpData) {
        return {
          success: false,
          message: 'Mã OTP không tồn tại hoặc đã hết hạn',
        };
      }

      if (otpData.otpCode !== otpCode) {
        return {
          success: false,
          message: 'Mã OTP không chính xác',
        };
      }

      if (Date.now() > otpData.expiresAt) {
        await this.redisService.clearOtp(phoneNumber);
        return {
          success: false,
          message: 'Mã OTP đã hết hạn',
        };
      }

      await this.redisService.clearOtp(phoneNumber);

      this.logger.log(`OTP verified successfully for ${phoneNumber}`);

      return {
        success: true,
        message: 'Xác thực thành công',
        data: {
          phoneNumber: otpData.phoneNumber,
          zaloUserId: otpData.zaloUserId,
          verifiedAt: Date.now(),
        },
      };
    } catch (error) {
      this.logger.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi xác thực',
      };
    }
  }

  async getOtpStatus(phoneNumber: string): Promise<{
    hasPending: boolean;
    hasOtp: boolean;
    expiresIn?: number;
  }> {
    const [pendingPhone, otpData] = await Promise.all([
      this.redisService.getPendingPhone(phoneNumber),
      this.redisService.getOtp(phoneNumber),
    ]);

    const result: any = {
      hasPending: !!pendingPhone,
      hasOtp: !!otpData,
    };

    if (otpData) {
      result.expiresIn = Math.max(0, Math.floor((otpData.expiresAt - Date.now()) / 1000));
    }

    return result;
  }
}
