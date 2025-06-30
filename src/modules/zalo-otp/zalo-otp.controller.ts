import { Controller, Post, Body, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { ZaloOtpService } from './zalo-otp.service';
import { SubmitPhoneDto } from './dto/submit-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('zalo-otp')
export class ZaloOtpController {
  constructor(
    private readonly otpService: ZaloOtpService,
    private readonly redisService: RedisService
  ) {}

  @Get('zalo-webhook')
  async handleZaloWebhook(@Query() webhookData: any) {
    return await this.otpService.handleZaloWebhook(webhookData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('send-otp')
  async sendOtp(@Query('phoneNumber') phoneNumber: string, @Req() req: any) {
    const userId = req.user?.id;
    return await this.otpService.sendOtp({ userId, phoneNumber });
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.otpService.verifyOtp(dto.userId, dto.phoneNumber, dto.otpCode);
  }

  @Get('status')
  async getStatus(@Query('phoneNumber') phoneNumber: string, @Req() req: any) {
    const userId = req.user?.id;
    return await this.otpService.getOtpStatus(userId, phoneNumber);
  }
}
