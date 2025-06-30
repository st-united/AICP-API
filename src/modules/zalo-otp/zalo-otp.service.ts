import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import axios from 'axios';
import { SubmitPhoneDto } from './dto/submit-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OTP_TTL_SECONDS, OTP_KEY_PREFIX, OTP_TIMESTAMP_PREFIX } from './contant';

@Injectable()
export class ZaloOtpService {
  constructor(private readonly redisService: RedisService) {}

  async handleZaloWebhook(webhookData: any) {
    console.log('Webhook received:', JSON.stringify(webhookData, null, 2));
    const code = webhookData.code;
    const data = {
      app_id: '3447155404625118731',
      app_secret: 'jUBKPA0WkMw3OVWpLuVD',
      code,
      grant_type: 'authorization_code',
    };
    const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: 'jUBKPA0WkMw3OVWpLuVD',
      },
    });
    console.log('res', res.data);
    const { access_token, refresh_token, expires_in } = res.data;
    this.redisService.setValue('zalo-refresh-token', refresh_token);
    this.redisService.setValue('zalo-access-token', access_token);
    this.redisService.setValue('zalo-expires-in', expires_in);
  }

  async generateOtp(phoneNumber: string): Promise<string> {
    // Sinh mã OTP ngẫu nhiên 6 số
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async canSendOtp(userId: string, phoneNumber: string): Promise<boolean> {
    const timestampKey = OTP_TIMESTAMP_PREFIX + userId + ':' + phoneNumber;
    const lastSent = await this.redisService.getValue(timestampKey);
    if (!lastSent) return true;
    const now = Date.now();
    if (now - Number(lastSent) >= OTP_TTL_SECONDS * 1000) return true;
    return false;
  }

  async saveOtp(userId: string, phoneNumber: string, otp: string): Promise<void> {
    const otpKey = OTP_KEY_PREFIX + userId + ':' + phoneNumber;
    const timestampKey = OTP_TIMESTAMP_PREFIX + userId + ':' + phoneNumber;
    await this.redisService.setValue(otpKey, otp, OTP_TTL_SECONDS);
    await this.redisService.setValue(timestampKey, Date.now().toString(), OTP_TTL_SECONDS);
  }

  async sendOtpToZalo(phoneNumber: string, otp: string, accessToken: string): Promise<any> {
    try {
      const url = 'https://business.openapi.zalo.me/message/template';
      const data = {
        phone_number: phoneNumber,
        template_id: 463118,
        template_data: {
          otp: otp,
        },
      };
      const res = await axios.post(url, data, {
        headers: {
          access_token: accessToken,
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error_code === 1002) {
        return { error: 'access_token_expired' };
      }
      return { error: err.message || 'send_otp_failed' };
    }
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = await this.redisService.getValue('zalo-refresh-token');
    const data = {
      app_id: '3447155404625118731',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      app_secret: 'jUBKPA0WkMw3OVWpLuVD',
    };
    try {
      const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: 'jUBKPA0WkMw3OVWpLuVD',
        },
      });
      const { access_token, refresh_token, expires_in } = res.data;
      await this.redisService.setValue('zalo-access-token', access_token, expires_in);
      await this.redisService.setValue('zalo-refresh-token', refresh_token);
      await this.redisService.setValue('zalo-expires-in', expires_in);
      return access_token;
    } catch (err: any) {
      throw new Error('Không thể refresh access token');
    }
  }

  async getOtpStatus(userId: string, phoneNumber: string): Promise<any> {
    const otpKey = OTP_KEY_PREFIX + userId + ':' + phoneNumber;
    const otp = await this.redisService.getValue(otpKey);
    return { otpActive: !!otp };
  }

  async verifyOtp(userId: string, phoneNumber: string, otp: string): Promise<boolean> {
    const otpKey = OTP_KEY_PREFIX + userId + ':' + phoneNumber;
    const savedOtp = await this.redisService.getValue(otpKey);
    return savedOtp === otp;
  }

  async sendOtp(dto: SubmitPhoneDto): Promise<any> {
    const { userId, phoneNumber } = dto;
    const canSend = await this.canSendOtp(userId, phoneNumber);
    if (!canSend) {
      return { message: 'Bạn chỉ được gửi lại OTP sau 5 phút.' };
    }
    const otp = await this.generateOtp(phoneNumber);
    await this.saveOtp(userId, phoneNumber, otp);
    let accessToken = await this.redisService.getValue('zalo-access-token');
    let sendResult = await this.sendOtpToZalo(phoneNumber, otp, accessToken);
    if (sendResult && sendResult.error && sendResult.error === 'access_token_expired') {
      accessToken = await this.refreshAccessToken();
      sendResult = await this.sendOtpToZalo(phoneNumber, otp, accessToken);
    }
    return sendResult;
  }
}
