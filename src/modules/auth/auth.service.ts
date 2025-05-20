import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CredentialsDto } from './dto/credentials.dto';
import { UserPayloadDto } from './dto/user-payload.dto';
import { JwtPayload } from '@Constant/types';
import { ResponseItem } from '@app/common/dtos';
import { TokenDto } from './dto/token.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from '@UsersModule/dto/response/user-response.dto';
import { UsersService } from '@UsersModule/users.service';
import * as jwt from 'jsonwebtoken';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService
  ) {}

  async validateUser(credentialsDto: CredentialsDto): Promise<UserPayloadDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: credentialsDto.email,
        // status: true,
        deletedAt: null,
      },
    });

    if (!user) throw new UnauthorizedException('Tài khoản không đúng');

    const comparePassword = bcrypt.compareSync(credentialsDto.password, user.password);
    if (!comparePassword) throw new UnauthorizedException('Mật khẩu không đúng');

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
    };
  }

  async login(userPayloadDto: UserPayloadDto, userAgent: string, ip: string): Promise<ResponseItem<TokenDto>> {
    let refreshToken: string;
    const payload: JwtPayload = { sub: userPayloadDto.id, email: userPayloadDto.email };

    // Check if user already has a refresh token
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userPayloadDto.id },
      select: { refreshToken: true },
    });

    if (existingUser) {
      refreshToken = existingUser.refreshToken;
    }

    // Only generate new refresh token if one doesn't exist
    if (!refreshToken) {
      refreshToken = this.tokenService.generateRefreshToken(payload);

      await this.prisma.user.update({
        where: { id: userPayloadDto.id },
        data: { refreshToken },
      });
    }
    // check if refresh token is expired
    const isRefreshTokenExpired = this.tokenService.checkExpiredToken(refreshToken, 'refresh');

    if (isRefreshTokenExpired) {
      refreshToken = this.tokenService.generateRefreshToken(payload);

      await this.prisma.user.update({
        where: { id: userPayloadDto.id },
        data: { refreshToken },
      });
    }

    const accessToken = this.tokenService.generateAccessToken(payload);
    const data = {
      name: userPayloadDto.name,
      accessToken,
      refreshToken,
    };

    await this.redisService.saveSessionToRedis(userPayloadDto.id, userAgent, ip);

    return new ResponseItem(data, 'Đăng nhập thành công');
  }

  async handleLogout(userId: string): Promise<ResponseItem<string>> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    if (!user) {
      throw new BadRequestException('Đăng xuất thiết bị không thành công');
    }

    await this.redisService.deleteSession(userId);

    return new ResponseItem('', 'Đăng xuất thiết bị thành công');
  }

  async refreshToken(token: string): Promise<ResponseItem<TokenDto>> {
    const user = await this.prisma.user.findFirst({
      where: {
        refreshToken: token,
        status: true,
        deletedAt: null,
      },
    });

    if (!user) throw new UnauthorizedException('Tài khoản không đúng');

    const payload: JwtPayload = { sub: user.id, email: user.email };

    const data = {
      accessToken: this.tokenService.generateAccessToken(payload),
    };

    return new ResponseItem(data, 'Làm mới token thành công');
  }

  async register(params: RegisterUserDto): Promise<ResponseItem<UserResponseDto>> {
    const user = await this.userService.create(params);

    const activationToken = this.tokenService.generateActivationToken(user.id);
    await this.emailService.sendActivationEmail(user.fullName, user.email, activationToken);

    return new ResponseItem(
      user,
      'Đăng ký tài khoản thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
      UserResponseDto
    );
  }

  async activateAccount(token: string): Promise<ResponseItem<null>> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACTIVATE_SECRETKEY) as { userId: string };

      const user = await this.userService.findById(decoded.userId);
      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      if (user.status) {
        throw new BadRequestException('Tài khoản đã được kích hoạt trước đó');
      }

      await this.userService.updateUserStatus(user.id, true);

      return new ResponseItem(null, 'Kích hoạt tài khoản thành công');
    } catch (error) {
      throw new BadRequestException('Mã kích hoạt không hợp lệ hoặc đã hết hạn');
    }
  }
}
