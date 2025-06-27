import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZaloService {
  private readonly logger = new Logger(ZaloService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async sendOtpMessage(zaloUserId: string, otpCode: string, phoneNumber: string): Promise<boolean> {
    try {
      const accessToken = this.configService.get('ZALO_ACCESS_TOKEN');
      console.log('Zalo access token:', accessToken);
      const url = 'https://openapi.zalo.me/v3.0/oa/message/cs';

      const messageData = {
        recipient: {
          user_id: zaloUserId,
        },
        message: {
          text: `🔐 Mã OTP cho số ${phoneNumber}:\n\n${otpCode}\n\n⏰ Có hiệu lực trong 5 phút\n❌ Không chia sẻ mã này với ai!`,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(url, messageData, {
          headers: {
            access_token: accessToken,
            'Content-Type': 'application/json',
          },
        })
      );

      if (response.data.error === 0) {
        this.logger.log(`OTP sent successfully to Zalo user: ${zaloUserId} for phone: ${phoneNumber}`);
        return true;
      } else {
        this.logger.error('Zalo API error:', response.data);
        return false;
      }
    } catch (error) {
      this.logger.error('Error sending OTP via Zalo:', error);
      return false;
    }
  }

  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
