import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { UserTokenPayloadDto } from './dto/user-token-payload.dto';
import { ClientTypeEnum, UserRoleEnum } from '@Constant/enums';

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
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        mentor: true,
      },
    });
    if (!user) throw new UnauthorizedException('Tài khoản không đúng');

    if (!user.status) throw new UnauthorizedException('Tài khoản chưa được kích hoạt');

    const hasMentorRole = user.roles.some((r) => r.role.name === UserRoleEnum.MENTOR);

    if (hasMentorRole && user.mentor && user.mentor.isActive === false) {
      throw new UnauthorizedException('Tài khoản mentor chưa được kích hoạt');
    }

    const comparePassword = bcrypt.compareSync(credentialsDto.password, user.password);
    if (!comparePassword) throw new UnauthorizedException('Mật khẩu không đúng');

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
    };
  }

  async login(UserAndSessionPayloadDto: UserAndSessionPayloadDto): Promise<ResponseItem<TokenDto>> {
    const { userPayloadDto, userAgent, ip, clientType } = UserAndSessionPayloadDto;
    let refreshToken: string;
    const payload: JwtPayload = { sub: userPayloadDto.id, email: userPayloadDto.email };

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userPayloadDto.id },
      select: {
        refreshToken: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (existingUser) {
      refreshToken = existingUser.refreshToken;
    }

    const userRoles = existingUser.roles.map((r) => r.role.name);

    if (
      clientType === ClientTypeEnum.WEB_ADMIN &&
      !userRoles.some((role: UserRoleEnum) => [UserRoleEnum.ADMIN, UserRoleEnum.MENTOR].includes(role))
    ) {
      throw new ForbiddenException('Bạn không có quyền truy cập trang quản trị');
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

  async loginWithGoogle(
    UserAndSessionPayloadDto: UserAndSessionPayloadDto,
    idToken: string
  ): Promise<ResponseItem<TokenDto>> {
    try {
      const { userPayloadDto, userAgent, ip } = UserAndSessionPayloadDto;
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      const { email, name, picture } = decodedToken;

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
          status: true,
        },
      });

      const tokenData = await this.generateTokensAndSession(user, name, userAgent, ip, !user.refreshToken);

      return new ResponseItem(tokenData, 'Đăng nhập thành công');
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private async generateTokensAndSession(
    user: UserTokenPayloadDto,
    name: string,
    userAgent: string,
    ip: string,
    isNewUser: boolean = false
  ): Promise<TokenDto> {
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

    const sessionDto: SessionDto = { userId: user.id, userAgent, ip };
    await this.redisService.saveSessionToRedis(sessionDto);

    return {
      name,
      accessToken,
      refreshToken,
      status: isNewUser,
    };
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

    if (!user) throw new UnauthorizedException('Tài khoản không hợp lệ');

    const payload: JwtPayload = { sub: user.id, email: user.email };

    const data = {
      accessToken: this.tokenService.generateAccessToken(payload),
    };

    return new ResponseItem(data, 'Làm mới token thành công');
  }

  async register(params: RegisterUserDto): Promise<ResponseItem<UserResponseDto>> {
    const user = await this.userService.create({ ...params, status: false });

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
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(`Mã kích hoạt đã hết hạn`);
      }
      throw new BadRequestException('Mã kích hoạt không hợp lệ');
    }
  }

  async resendActivationEmail(email: string): Promise<ResponseItem<null>> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    if (user.status) {
      throw new BadRequestException('Tài khoản đã được kích hoạt trước đó');
    }

    const resendKey = `resend_activation_email:${user.id}`;
    const alreadySent = await this.redisService.getValue(resendKey);
    if (alreadySent) {
      throw new BadRequestException('Email kích hoạt đã được gửi trước đó. Vui lòng kiểm tra hộp thư của bạn.');
    }

    const activationToken = this.tokenService.generateActivationToken(user.id);

    await this.emailService.sendActivationEmail(user.fullName, user.email, activationToken);
    await this.redisService.setValue(resendKey, 'sent', 86400);

    return new ResponseItem(null, 'Email kích hoạt đã được gửi lại thành công. Vui lòng kiểm tra hộp thư của bạn.');
  }

  async sendActivationReminders(): Promise<void> {
    const twentyNineDaysAgo = new Date();
    twentyNineDaysAgo.setDate(twentyNineDaysAgo.getDate() - 29);
    const inactiveUsers = await this.getInactiveUsers(twentyNineDaysAgo);
    for (const user of inactiveUsers) {
      try {
        if (await this.shouldSendReminder(user.id)) {
          const activationToken = this.tokenService.generateActivationToken(user.id);
          await this.emailService.sendActivationReminderEmail(user.fullName, user.email, activationToken);
        }
      } catch {
        await this.redisService.deleteValue(`activation_reminder_sent:${user.id}`);
      }
    }
  }

  async deleteInactiveAccounts(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const inactiveUsers = await this.getInactiveUsers(thirtyDaysAgo);
    for (const user of inactiveUsers) {
      try {
        if (await this.shouldDeleteAccount(user.id)) {
          await this.emailService.sendAccountDeletionEmail(user.fullName, user.email);
          await this.softDeleteUser(user.id);
        }
      } catch {
        await this.redisService.deleteValue(`deletion_notification_sent:${user.id}`);
      }
    }
  }

  private async getInactiveUsers(date: Date) {
    return await this.prisma.user.findMany({
      where: {
        status: false,
        deletedAt: null,
        createdAt: { lte: date },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });
  }

  private async shouldSendReminder(userId: string): Promise<boolean> {
    const reminderKey = `activation_reminder_sent:${userId}`;
    const existingReminder = await this.redisService.getValue(reminderKey);

    if (existingReminder) return false;

    const wasSet = await this.redisService.setIfNotExists(reminderKey, 'sent');
    return wasSet;
  }

  private async shouldDeleteAccount(userId: string): Promise<boolean> {
    const reminderKey = `activation_reminder_sent:${userId}`;
    const deletionKey = `deletion_notification_sent:${userId}`;

    const hasReminderSent = await this.redisService.getValue(reminderKey);
    const hasDeletionSent = await this.redisService.getValue(deletionKey);

    if (!hasReminderSent || hasDeletionSent) return false;

    const wasSet = await this.redisService.setIfNotExists(deletionKey, 'sent');
    return wasSet;
  }

  private async softDeleteUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: false,
      },
    });
  }
}
