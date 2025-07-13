import { ResponseItem } from '@app/common/dtos';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAccessTokenGuard } from './guards/jwt-access-token.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResendActivationEmailDto } from './dto/resend-activation-email.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserAndSessionPayloadDto, UserPayloadDto } from './dto/user-payload.dto';
import { ClientTypeEnum } from '@Constant/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login for user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Req() request): Promise<ResponseItem<TokenDto>> {
    const userAgent = request.headers['user-agent'];
    const clientType: ClientTypeEnum = request.headers['x-client-type'];
    const ip = request.ip;
    const userPayloadDto: UserPayloadDto = request.user;
    const userAndSessionPayloadDto: UserAndSessionPayloadDto = { userPayloadDto, userAgent, ip, clientType };
    return await this.authService.login(userAndSessionPayloadDto);
  }

  @Post('login-google')
  @ApiOperation({ summary: 'Login using Google OAuth' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: {
          type: 'string',
          example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4ODMzZTg...',
        },
      },
      required: ['idToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: `Login successful.

  - If \`data.status = true\`: This is a **new user** logging in for the first time.
  - If \`data.status = false\`: This is a **returning user**.`,
    type: ResponseItem<TokenDto>,
  })
  async loginWithGoogle(@Req() request, @Body('idToken') idToken: string) {
    const userAgent = request.headers['user-agent'];
    const ip = request.ip;
    const userPayloadDto: UserPayloadDto = null;
    const clientType: ClientTypeEnum = request.headers['x-client-type'];
    const userAndSessionPayloadDto: UserAndSessionPayloadDto = { userPayloadDto, userAgent, ip, clientType };
    if (!idToken) {
      throw new BadRequestException('idToken is required');
    }
    return this.authService.loginWithGoogle(userAndSessionPayloadDto, idToken);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('logout')
  async logout(@Req() request) {
    return this.authService.handleLogout(request.user.userId);
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

  @Post('resend-activation-email')
  @ApiOperation({ summary: 'Resend activation email' })
  @ApiResponse({ status: 200, description: 'Activation email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email or account already activated' })
  @ApiBody({ type: ResendActivationEmailDto })
  async resendActivationEmail(@Body() resendActivationEmailDto: ResendActivationEmailDto) {
    return await this.authService.resendActivationEmail(resendActivationEmailDto.email);
  }

  @Post('send-activation-reminders')
  @ApiOperation({
    summary: 'Manually trigger activation reminders (Admin only) - Each user receives only one reminder',
  })
  @ApiResponse({ status: 200, description: 'Activation reminders sent successfully' })
  async sendActivationReminders() {
    const result = await this.authService.sendActivationReminders();
    return new ResponseItem(
      result,
      `Đã gửi ${result.success} email nhắc nhở thành công, ${result.failed} email thất bại.`
    );
  }

  @Post('delete-inactive-accounts')
  @ApiOperation({
    summary: 'Manually trigger deletion of inactive accounts (Admin only) - Deletes accounts after 30 days',
  })
  @ApiResponse({ status: 200, description: 'Account deletion completed successfully' })
  async deleteInactiveAccounts() {
    const result = await this.authService.deleteInactiveAccounts();
    return new ResponseItem(
      result,
      `Đã xóa ${result.success} tài khoản thành công, ${result.failed} tài khoản thất bại.`
    );
  }
}
