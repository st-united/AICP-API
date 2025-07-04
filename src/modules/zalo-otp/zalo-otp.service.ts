import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { SubmitPhoneDto } from './dto/submit-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OTP_TTL_SECONDS, OTP_KEY_PREFIX, OTP_TIMESTAMP_PREFIX } from './contant';
import { ResponseItem } from '@app/common/dtos';
import { OtpStatusDto } from './dto/response/otp-status.dto';
import { SendOtpResponseDto } from './dto/response/send-otp-response.dto';
import { VerifyOtpResponseDto } from './dto/response/verify-otp-response.dto';
import {
  ZaloApiException,
  OtpRateLimitException,
  OtpExpiredException,
  OtpInvalidException,
} from './exceptions/zalo-otp.exception';

@Injectable()
export class ZaloOtpService {
  private readonly logger = new Logger(ZaloOtpService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService
  ) {}

  async handleZaloWebhook(webhookData: any): Promise<ResponseItem<any>> {
    try {
      const code = webhookData.code;
      if (!code) {
        throw new BadRequestException('Code is required in webhook data');
      }

      const data = {
        app_id: process.env.ZALO_APP_ID,
        app_secret: process.env.ZALO_APP_SECRET,
        code,
        grant_type: 'authorization_code',
      };

      this.logger.log(`Processing Zalo webhook with code: ${code}`);

      const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token, expires_in } = res.data;

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
      throw new InternalServerErrorException('Failed to process Zalo webhook');
    }
  }

  async generateOtp(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async checkPhoneVerification(userId: string, phone: string): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true, zaloVerified: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user.zaloVerified;
    } catch (error) {
      this.logger.error(`Error checking phone verification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async canSendOtp(userId: string, phoneNumber: string): Promise<boolean> {
    try {
      const timestampKey = OTP_TIMESTAMP_PREFIX + userId + ':' + phoneNumber;
      const lastSent = await this.redisService.getValue(timestampKey);

      if (!lastSent) return true;

      const now = Date.now();
      const timeDiff = now - Number(lastSent);
      const cooldownPeriod = OTP_TTL_SECONDS * 1000;

      return timeDiff >= cooldownPeriod;
    } catch (error) {
      this.logger.error(`Error checking OTP send permission: ${error.message}`, error.stack);
      return false;
    }
  }

  async saveOtp(userId: string, phoneNumber: string, otp: string): Promise<void> {
    try {
      const otpKey = OTP_KEY_PREFIX + userId + ':' + phoneNumber;
      const timestampKey = OTP_TIMESTAMP_PREFIX + userId + ':' + phoneNumber;

      await this.redisService.setValue(otpKey, otp, OTP_TTL_SECONDS);
      await this.redisService.setValue(timestampKey, Date.now().toString(), OTP_TTL_SECONDS);

      this.logger.log(`OTP saved for user ${userId}, phone ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`Error saving OTP: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to save OTP');
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
        this.logger.error(`Zalo API error: ${res.data.message}`);
        return { error: res.data.message };
      }
    } catch (err: any) {
      this.logger.error(`Error sending OTP to Zalo: ${err.message}`, err.stack);

      if (err.response && err.response.data && err.response.data.error_code === 1002) {
        return { error: 'access_token_expired' };
      }

      return { error: err.message || 'send_otp_failed' };
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = await this.redisService.getValue('zalo-refresh-token');

      if (!refreshToken) {
        throw new BadRequestException('Refresh token not found');
      }

      const data = {
        app_id: process.env.ZALO_APP_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        app_secret: process.env.ZALO_APP_SECRET,
      };

      this.logger.log('Refreshing Zalo access token');

      const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
      throw new InternalServerErrorException('Không thể refresh access token');
    }
  }

  async getPhoneStatus(userId: string, phoneNumber: string): Promise<ResponseItem<OtpStatusDto>> {
    try {
      const isVerified = await this.checkPhoneVerification(userId, phoneNumber);
      return new ResponseItem({ otpActive: isVerified }, 'OTP status retrieved successfully', OtpStatusDto);
    } catch (error) {
      this.logger.error(`Error getting OTP status: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to get OTP status');
    }
  }

  async verifyOtp(userId: string, phoneNumber: string, otp: string): Promise<ResponseItem<VerifyOtpResponseDto>> {
    try {
      const otpKey = OTP_KEY_PREFIX + userId + ':' + phoneNumber;
      const savedOtp = await this.redisService.getValue(otpKey);

      if (!savedOtp) {
        throw new OtpExpiredException();
      }

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
    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  async sendOtp(userId: string, dto: SubmitPhoneDto): Promise<ResponseItem<SendOtpResponseDto>> {
    try {
      const { phone } = dto;

      const isVerified = await this.checkPhoneVerification(userId, phone);
      if (isVerified) {
        throw new BadRequestException('Số điện thoại đã được xác thực Zalo.');
      }

      const canSend = await this.canSendOtp(userId, phone);
      if (!canSend) {
        throw new OtpRateLimitException();
      }

      const otp = await this.generateOtp();
      let accessToken = (await this.redisService.getValue('zalo-access-token')) || process.env.ZALO_ACCESS_TOKEN;

      if (!accessToken) {
        throw new InternalServerErrorException('Zalo access token not configured');
      }

      let sendResult = await this.sendOtpToZalo(userId, phone, otp, accessToken);

      if (sendResult && sendResult.error && sendResult.error === 'access_token_expired') {
        this.logger.log('Access token expired, refreshing...');
        accessToken = await this.refreshAccessToken();
        sendResult = await this.sendOtpToZalo(userId, phone, otp, accessToken);
      }

      if (sendResult && sendResult.error) {
        throw new ZaloApiException(sendResult.error);
      }

      return new ResponseItem({ success: true }, 'OTP đã được gửi thành công', SendOtpResponseDto);
    } catch (error) {
      this.logger.error(`Error sending OTP: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }
}
