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
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ZaloOtpService } from './zalo-otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ResponseItem } from '@app/common/dtos';
import { OtpStatusDto } from './dto/response/otp-status.dto';
import { SendOtpResponseDto } from './dto/response/send-otp-response.dto';
import { VerifyOtpResponseDto } from './dto/response/verify-otp-response.dto';
import { CanSendOtpResponseDto } from './dto/response/can-send-otp-response.dto';
import { join } from 'path';
import { existsSync } from 'fs';

@ApiTags('Zalo OTP')
@Controller('zalo-otp')
export class ZaloOtpController {
  constructor(private readonly otpService: ZaloOtpService) {}

  private extractUserId(req: any): string {
    const { userId } = req.user;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy userId trong request');
    }
    return userId;
  }

  @Get('zalo-webhook')
  @ApiOperation({ summary: 'Xử lý webhook Zalo cho OAuth' })
  @ApiQuery({ name: 'code', description: 'Mã xác thực từ Zalo' })
  @ApiResponse({
    status: 200,
    description: 'Xử lý webhook thành công',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ - thiếu mã code',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi máy chủ nội bộ',
  })
  async handleZaloWebhook(@Query() webhookData: any): Promise<ResponseItem<any>> {
    if (!webhookData.code) {
      throw new BadRequestException('Thiếu mã code trong dữ liệu webhook');
    }
    return await this.otpService.handleZaloWebhook(webhookData);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi OTP đến số điện thoại qua Zalo' })
  @ApiResponse({
    status: 200,
    description: 'Gửi OTP thành công',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ - số điện thoại không hợp lệ hoặc vượt quá giới hạn gửi',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi máy chủ nội bộ',
  })
  async sendOtp(@Req() req): Promise<ResponseItem<SendOtpResponseDto>> {
    return await this.otpService.sendOtp(this.extractUserId(req));
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xác thực mã OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Xác thực OTP thành công',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ - mã OTP không hợp lệ hoặc đã hết hạn',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi máy chủ nội bộ',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: any): Promise<ResponseItem<VerifyOtpResponseDto>> {
    return await this.otpService.verifyOtp(this.extractUserId(req), dto.otp);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy trạng thái OTP cho số điện thoại' })
  @ApiQuery({
    name: 'phone',
    description: 'Số điện thoại cần kiểm tra trạng thái OTP',
    example: '+84901234567',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy trạng thái OTP thành công',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ - thiếu số điện thoại',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi máy chủ nội bộ',
  })
  async getPhoneStatus(@Req() req: any): Promise<ResponseItem<OtpStatusDto>> {
    return await this.otpService.getPhoneStatus(this.extractUserId(req));
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('can-send-otp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kiểm tra thời gian có thể gửi OTP' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thời gian gửi OTP thành công',
    type: ResponseItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ - không tìm thấy người dùng',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực',
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi máy chủ nội bộ',
  })
  async getCanSendOtpTime(@Req() req: any): Promise<ResponseItem<CanSendOtpResponseDto>> {
    return await this.otpService.getCanSendOtpTime(this.extractUserId(req));
  }

  @Get('country-codes')
  async getCountryCodes(): Promise<ResponseItem<any>> {
    return await this.otpService.getCountryCodes();
  }

  @Get(':filename')
  serveStaticFile(@Param('filename') filename: string, @Res() res) {
    const filePath = join(process.cwd(), 'public', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    res.sendFile(filePath);
  }
}
