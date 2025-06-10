import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CredentialsDto } from './dto/credentials.dto';
import { UserPayloadDto, UserAndSessionPayloadDto } from './dto/user-payload.dto';
import { JwtPayload } from '@Constant/types';
import { ResponseItem } from '@app/common/dtos';
import { TokenDto } from './dto/token.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from '@UsersModule/dto/response/user-response.dto';
import { UsersService } from '@UsersModule/users.service';
import * as jwt from 'jsonwebtoken';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';
import { TokenService } from './services/token.service';
import { SessionDto } from '../redis/dto/session.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
    private readonly firebaseService: FirebaseService
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

  async login(UserAndSessionPayloadDto: UserAndSessionPayloadDto): Promise<ResponseItem<TokenDto>> {
    const { userPayloadDto, userAgent, ip } = UserAndSessionPayloadDto;
    let refreshToken: string;
    const payload: JwtPayload = { sub: userPayloadDto.id, email: userPayloadDto.email };

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userPayloadDto.id },
      select: { refreshToken: true },
    });

    if (existingUser) {
      refreshToken = existingUser.refreshToken;
    }

    if (!refreshToken) {
      refreshToken = this.tokenService.generateRefreshToken(payload);

      await this.prisma.user.update({
        where: { id: userPayloadDto.id },
        data: { refreshToken },
      });
    }
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

    const sessionDto: SessionDto = { userId: userPayloadDto.id, userAgent, ip };
    await this.redisService.saveSessionToRedis(sessionDto);

    return new ResponseItem(data, 'Đăng nhập thành công');
  }

  async loginWithGoogle(idToken: string): Promise<ResponseItem<TokenDto>> {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      const { email, name, picture } = decodedToken;
      console.log(email);

      const hashedPassword = await bcrypt.hash('loginWithGooogle', 10);

      const user = await this.prisma.user.upsert({
        where: { email },
        update: {
          fullName: name,
          avatarUrl: picture,
        },
        create: {
          email,
          fullName: name,
          avatarUrl: picture,
          password: hashedPassword,
          phoneNumber: null,
        },
      });

      const isNewUser = !user.refreshToken;
      const payload: JwtPayload = { sub: user.id, email: user.email };
      let refreshToken = user.refreshToken;

      if (!refreshToken || this.tokenService.checkExpiredToken(refreshToken, 'refresh')) {
        refreshToken = this.tokenService.generateRefreshToken(payload);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { refreshToken },
        });
      }

      const accessToken = this.tokenService.generateAccessToken(payload);

      const sessionDto: SessionDto = {
        userId: user.id,
        userAgent: 'google-login',
        ip: '',
      };
      await this.redisService.saveSessionToRedis(sessionDto);

      const data: TokenDto = {
        name: user.fullName,
        accessToken,
        refreshToken,
      };

      const message = isNewUser ? 'Tạo tài khoản' : 'Cập nhật tài khoản';

      return new ResponseItem(data, message);
    } catch (error) {
      throw new BadRequestException(error);
    }
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
