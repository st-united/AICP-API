import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { ResponseItem } from '@app/common/dtos';
import { OtpStatusDto } from './dto/response/otp-status.dto';
import { SendOtpResponseDto } from './dto/response/send-otp-response.dto';
import { VerifyOtpResponseDto } from './dto/response/verify-otp-response.dto';
import { CanSendOtpResponseDto } from './dto/response/can-send-otp-response.dto';
import { ZaloErrorTranslator } from './utils/zalo-error-translator';
import {
  ZaloApiException,
  OtpRateLimitException,
  OtpExpiredException,
  OtpInvalidException,
} from './exceptions/zalo-otp.exception';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ZaloOtpService {
  private readonly logger = new Logger(ZaloOtpService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async handleZaloWebhook(webhookData: any): Promise<ResponseItem<any>> {
    try {
      const code = webhookData.code;
      if (!code) {
        throw new BadRequestException('Thiếu mã code trong dữ liệu webhook');
      }

      const data = {
        app_id: process.env.ZALO_APP_ID,
        code,
        grant_type: 'authorization_code',
      };

      this.logger.log(`Processing Zalo webhook with code: ${code}`);

      const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: process.env.ZALO_APP_SECRET_KEY,
        },
      });

      const { access_token, refresh_token, expires_in } = res.data;
      this.logger.log(res.data);
      await this.redisService.setValue('zalo-refresh-token', refresh_token);
      await this.redisService.setValue('zalo-access-token', access_token);
      await this.redisService.setValue('zalo-expires-in', expires_in);

      this.logger.log('Zalo webhook processed successfully');

      return new ResponseItem({ access_token, refresh_token, expires_in }, 'Zalo webhook processed successfully');
    } catch (error) {
      this.logger.error(`Error processing Zalo webhook: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi xử lý webhook Zalo');
    }
  }

  async generateOtp(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async getUserById(userId: string, select?: any) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: select || { phoneNumber: true, zaloVerified: true },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    return user as any;
  }

  async checkPhoneVerification(userId: string): Promise<{ phoneNumber: string; zaloVerified: boolean }> {
    const user = await this.getUserById(userId);
    return { phoneNumber: user.phoneNumber, zaloVerified: user.zaloVerified };
  }

  async canSendOtp(userId: string, phoneNumber: string): Promise<boolean> {
    try {
      const otpKey = this.configService.get<string>('OTP_KEY_PREFIX') + userId + ':' + phoneNumber;
      const otpData = await this.redisService.getValue(otpKey);

      if (!otpData) return true;

      const data = JSON.parse(otpData);
      const lastSent = data.timestamp;

      if (!lastSent) return true;

      const now = Date.now();
      const timeDiff = now - Number(lastSent);
      const cooldownPeriod = parseInt(this.configService.get<string>('OTP_TTL_SECONDS')) * 1000;

      return timeDiff >= cooldownPeriod;
    } catch (error) {
      this.logger.error(`Error checking OTP send permission: ${error.message}`, error.stack);
      return false;
    }
  }

  async saveOtp(userId: string, phoneNumber: string, otp: string): Promise<void> {
    try {
      const otpKey = this.configService.get<string>('OTP_KEY_PREFIX') + userId + ':' + phoneNumber;
      const ttl = parseInt(this.configService.get<string>('OTP_TTL_SECONDS'));
      const otpData = {
        otp: otp,
        timestamp: Date.now().toString(),
      };
      await this.redisService.setValue(otpKey, JSON.stringify(otpData), ttl);

      this.logger.log(`OTP saved for user ${userId}, phone ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`Error saving OTP: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Lỗi lưu OTP');
    }
  }

  async sendOtpToZalo(userId: string, phone: string, otp: string, accessToken: string): Promise<any> {
    try {
      const url = 'https://business.openapi.zalo.me/message/template';

      const data = {
        phone: phone,
        template_id: process.env.ZALO_TEMPLATE_OTP_ID,
        template_data: {
          otp: otp,
        },
      };

      this.logger.log(`Sending OTP to Zalo for user ${userId}, phone ${phone}`);

      const res = await axios.post(url, data, {
        headers: {
          access_token: accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (res.data.error === 0) {
        await this.saveOtp(userId, phone, otp);
        this.logger.log(`OTP sent successfully to user ${userId}, phone ${phone}`);
        return res.data;
      } else {
        const errorMessage = res.data.message;
        this.logger.error(`Zalo API error: ${errorMessage}`);
        return { error: errorMessage, errorCode: res.data.error };
      }
    } catch (err: any) {
      this.logger.error(`Error sending OTP to Zalo: ${err.message}`, err.stack);

      if (err.response && err.response.data && err.response.data.error_code === 1002) {
        return { error: 'access_token_expired', errorCode: 1002 };
      }

      if (err.response && err.response.data && err.response.data.error) {
        return {
          error: err.response.data.message || err.response.data.error,
          errorCode: err.response.data.error,
        };
      }

      const errorMessage = err.message || 'send_otp_failed';
      return { error: errorMessage };
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = await this.redisService.getValue('zalo-refresh-token');

      if (!refreshToken) {
        throw new BadRequestException('Không tìm thấy refresh token');
      }

      const data = {
        app_id: process.env.ZALO_APP_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      };

      this.logger.log('Refreshing Zalo access token');

      const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: process.env.ZALO_APP_SECRET_KEY,
        },
      });

      const { access_token, refresh_token, expires_in } = res.data;

      await this.redisService.setValue('zalo-access-token', access_token, expires_in);
      await this.redisService.setValue('zalo-refresh-token', refresh_token);
      await this.redisService.setValue('zalo-expires-in', expires_in);

      this.logger.log('Zalo access token refreshed successfully');

      return access_token;
    } catch (err: any) {
      this.logger.error(`Error refreshing access token: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Không thể làm mới access token');
    }
  }

  async getPhoneStatus(userId: string): Promise<ResponseItem<OtpStatusDto>> {
    const { phoneNumber, zaloVerified } = await this.checkPhoneVerification(userId);
    return new ResponseItem({ phoneNumber, zaloVerified }, 'Lấy trạng thái OTP thành công', OtpStatusDto);
  }

  async getCanSendOtpTime(userId: string): Promise<ResponseItem<CanSendOtpResponseDto>> {
    const user = await this.getUserById(userId, { phoneNumber: true });
    const { phoneNumber } = user;

    const otpKey = this.configService.get<string>('OTP_KEY_PREFIX') + userId + ':' + phoneNumber;
    const otpData = await this.redisService.getValue(otpKey);

    if (!otpData) {
      return new ResponseItem({ canSend: true }, 'Có thể gửi OTP ngay lập tức', CanSendOtpResponseDto);
    }

    const data = JSON.parse(otpData);
    const lastSent = data.timestamp;

    if (!lastSent) {
      return new ResponseItem({ canSend: true }, 'Có thể gửi OTP ngay lập tức', CanSendOtpResponseDto);
    }

    const now = Date.now();
    const lastSentTime = Number(lastSent);
    const cooldownPeriod = parseInt(this.configService.get<string>('OTP_TTL_SECONDS')) * 1000;
    const timeDiff = now - lastSentTime;
    const remainingTime = cooldownPeriod - timeDiff;

    if (remainingTime <= 0) {
      return new ResponseItem({ canSend: true }, 'Có thể gửi OTP ngay lập tức', CanSendOtpResponseDto);
    }

    const remainingSeconds = Math.ceil(remainingTime / 1000);
    const nextSendTime = lastSentTime + cooldownPeriod;

    return new ResponseItem(
      {
        canSend: false,
        remainingSeconds,
        nextSendTime,
      },
      'Cần chờ thêm thời gian để gửi OTP',
      CanSendOtpResponseDto
    );
  }

  async verifyOtp(userId: string, otp: string): Promise<ResponseItem<VerifyOtpResponseDto>> {
    const { phoneNumber, zaloVerified } = await this.checkPhoneVerification(userId);

    if (zaloVerified) {
      throw new BadRequestException('Số điện thoại đã được xác thực Zalo.');
    }

    const otpKey = this.configService.get<string>('OTP_KEY_PREFIX') + userId + ':' + phoneNumber;
    const otpData = await this.redisService.getValue(otpKey);

    if (!otpData) {
      throw new OtpExpiredException();
    }

    const data = JSON.parse(otpData);
    const savedOtp = data.otp;

    if (savedOtp === otp) {
      await this.redisService.deleteValue(otpKey);
      this.logger.log(`OTP verified successfully for user ${userId}, phone ${phoneNumber}`);
      await this.prismaService.user.update({
        where: { id: userId },
        data: { zaloVerified: true },
      });
      return new ResponseItem({ verified: true }, 'OTP xác thực thành công', VerifyOtpResponseDto);
    } else {
      this.logger.warn(`Invalid OTP attempt for user ${userId}, phone ${phoneNumber}`);
      throw new OtpInvalidException();
    }
  }

  async sendOtp(userId: string): Promise<ResponseItem<SendOtpResponseDto>> {
    const { phoneNumber, zaloVerified } = await this.checkPhoneVerification(userId);

    if (zaloVerified) {
      throw new BadRequestException('Số điện thoại đã được xác thực Zalo.');
    }

    const canSend = await this.canSendOtp(userId, phoneNumber);
    if (!canSend) {
      throw new OtpRateLimitException();
    }

    const otp = await this.generateOtp();
    let accessToken = (await this.redisService.getValue('zalo-access-token')) || process.env.ZALO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new InternalServerErrorException('Chưa cấu hình access token Zalo');
    }

    let sendResult = await this.sendOtpToZalo(userId, phoneNumber, otp, accessToken);

    if (sendResult?.error && ZaloErrorTranslator.isAccessTokenError(sendResult.error, sendResult.errorCode)) {
      this.logger.log('Token error: ', sendResult.error);
      accessToken = await this.refreshAccessToken();
      sendResult = await this.sendOtpToZalo(userId, phoneNumber, otp, accessToken);
    }

    if (sendResult?.error) {
      this.logger.log('Send otp error: ', sendResult.error);
      if (ZaloErrorTranslator.isPhoneNumberError(sendResult.error)) {
        throw new BadRequestException(ZaloErrorTranslator.translateError(sendResult.error, sendResult.errorCode));
      }
      throw new ZaloApiException(ZaloErrorTranslator.translateError(sendResult.error, sendResult.errorCode));
    }

    return new ResponseItem({ success: true }, 'OTP đã được gửi thành công', SendOtpResponseDto);
  }
  async getCountryCodes(): Promise<ResponseItem<any>> {
    const res = await axios.get('https://restcountries.com/v3.1/all?fields=idd,name,flags,cca2');
    const countries = res.data
      .map((c: any) => {
        const root = c.idd?.root || '';
        const suffixes = c.idd?.suffixes || [''];
        const dialCode = suffixes.map((s: string) => `${root}${s}`).join(', ');
        return {
          name: c.name.common,
          dialCode: dialCode ? `+${dialCode.replace('+', '')}` : '',
          flag: c.flags.png,
          code: c.cca2,
        };
      })
      .filter((c: any) => c.dialCode);

    return new ResponseItem(countries, 'Lấy danh sách mã quốc gia thành công');
  }
}
