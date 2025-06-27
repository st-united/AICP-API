import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ZaloOtpService } from './zalo-otp.service';
import { SubmitPhoneDto } from './dto/submit-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('zalo-otp')
export class ZaloOtpController {
  constructor(private readonly otpService: ZaloOtpService) {}

  // @Post()
  // getRoot(@Res() res: Response) {
  //   res.status(200).send('Server is running');
  // }

  @Post('submit-phone')
  async submitPhone(@Body() dto: SubmitPhoneDto) {
    return await this.otpService.submitPhoneNumber(dto.phoneNumber);
  }

  @Post('zalo-webhook')
  async handleZaloWebhook(@Body() webhookData: any): Promise<{ success: boolean; message: string }> {
    console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

    if (!webhookData || !webhookData.event_name) {
      console.error('Invalid webhook data:', webhookData);
      return { success: false, message: 'Invalid webhook data' };
    }

    const { event_name, user_id_by_app, follower, message } = webhookData;
    let userId: string | undefined;

    if (event_name === 'follow' && (user_id_by_app || follower?.id)) {
      const userId = follower.id;
      await this.otpService.handleZaloInteraction(userId, null);
      return { success: true, message: 'Webhook processed' };
    }

    if (event_name === 'user_send_text' && user_id_by_app && webhookData.message?.text) {
      userId = user_id_by_app;
      await this.otpService.handleZaloInteraction(userId, webhookData.message.text);
      return { success: true, message: 'Webhook processed' };
    }

    console.log(`Unhandled event: ${event_name}`);
    return { success: true, message: 'Webhook processed' };
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.otpService.verifyOtp(dto.phoneNumber, dto.otpCode);
  }

  @Get('status')
  async getStatus(@Query('phoneNumber') phoneNumber: string) {
    return await this.otpService.getOtpStatus(phoneNumber);
  }
}
