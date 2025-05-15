import { ResponseItem } from '@app/common/dtos';
import { Body, Controller, Get, Headers, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAccessTokenGuard } from './guards/jwt-access-token.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RedisService } from '../redis/redis.service';
import { validateDeviceId } from '@app/common/utils/stringUtils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login for user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Req() request): Promise<ResponseItem<TokenDto>> {
    const loginResponse = await this.authService.login(request.user);
    if (loginResponse) {
      const deviceId = validateDeviceId(request.headers['device-id']);
      const ip = request.ip;
      await this.redisService.saveSessionToRedis(request.user.id, deviceId, ip);
    }
    return loginResponse;
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('logout')
  async logout(@Req() request) {
    await this.redisService.deleteSession(request.user.userId, request.clientInfo);
    return this.authService.logoutWithMessage(request.user.userId, 'Đăng xuất');
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('logout-all')
  async logoutAllDevices(@Req() request) {
    await this.redisService.deleteAllSessions(request.user.userId);
    return this.authService.logoutAllDevices(request.user.userId);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('logout-others')
  async logoutOtherDevices(@Req() request) {
    await this.redisService.deleteOtherSessions(request.user.userId, request.clientInfo);
    return this.authService.logoutWithMessage(request.user.userId, 'Đăng xuất các thiết bị khác');
  }

  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(200)
  @Get('refresh')
  refresh(@Headers('Authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    return this.authService.refreshToken(token);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async register(@Body() params: RegisterUserDto) {
    return await this.authService.register(params);
  }

  @ApiOperation({ summary: 'Activate User' })
  @ApiResponse({ status: 201, description: 'Activation successful' })
  @ApiResponse({ status: 400, description: 'The activation code is invalid or expired.' })
  @Get('activate')
  async activateAccount(@Query('token') token: string) {
    return await this.authService.activateAccount(token);
  }
}
