import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ZaloOtpService } from './zalo-otp.service';
import { SubmitPhoneDto } from './dto/submit-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ResponseItem } from '@app/common/dtos';
import { OtpStatusDto } from './dto/response/otp-status.dto';
import { SendOtpResponseDto } from './dto/response/send-otp-response.dto';
import { VerifyOtpResponseDto } from './dto/response/verify-otp-response.dto';

@ApiTags('Zalo OTP')
@Controller('zalo-otp')
export class ZaloOtpController {
  constructor(private readonly otpService: ZaloOtpService) {}

  @Get('zalo-webhook')
  @ApiOperation({ summary: 'Handle Zalo webhook for OAuth' })
  @ApiQuery({ name: 'code', description: 'Authorization code from Zalo' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing code',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async handleZaloWebhook(@Query() webhookData: any): Promise<ResponseItem<any>> {
    if (!webhookData.code) {
      throw new BadRequestException('Code is required in webhook data');
    }
    return await this.otpService.handleZaloWebhook(webhookData);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send OTP to phone number via Zalo' })
  @ApiBody({ type: SubmitPhoneDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid phone or rate limit exceeded',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async sendOtp(@Body() dto: SubmitPhoneDto, @Req() req): Promise<ResponseItem<SendOtpResponseDto>> {
    const { userId } = req.user;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    return await this.otpService.sendOtp(userId, dto);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid OTP or OTP expired',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: any): Promise<ResponseItem<VerifyOtpResponseDto>> {
    const { userId } = req.user;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    return await this.otpService.verifyOtp(userId, dto.phone, dto.otp);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OTP status for phone number' })
  @ApiQuery({
    name: 'phone',
    description: 'Phone number to check OTP status',
    example: '+84901234567',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP status retrieved successfully',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing phone number',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getPhoneStatus(@Query('phone') phone: string, @Req() req: any): Promise<ResponseItem<OtpStatusDto>> {
    const { userId } = req.user;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }
    return await this.otpService.getPhoneStatus(userId, phone);
  }
}
