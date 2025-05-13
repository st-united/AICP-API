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
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private userService: UsersService
  ) {}

  async validateUser(credentialsDto: CredentialsDto): Promise<UserPayloadDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: credentialsDto.email,
        status: true,
        deletedAt: null,
      },
    });

    if (!user) throw new UnauthorizedException('Tài khoản không đúng');

    const comparePassword = bcrypt.compareSync(credentialsDto.password, user.password);
    if (!comparePassword) throw new UnauthorizedException('Tài khoản không đúng');

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
    };
  }

  async login(userPayloadDto: UserPayloadDto): Promise<ResponseItem<TokenDto>> {
    const payload: JwtPayload = { sub: userPayloadDto.id, email: userPayloadDto.email };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRETKEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES'),
    });
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRETKEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES'),
    });

    await this.prisma.user.update({
      where: { id: userPayloadDto.id },
      data: { refreshToken },
    });

    const data = {
      name: userPayloadDto.name,
      accessToken,
      refreshToken,
    };

    return new ResponseItem(data, 'Đăng nhập thành công');
  }

  async logout(userId: string): Promise<ResponseItem<string>> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    if (!user) {
      throw new BadRequestException('Đăng xuất không thành công');
    }

    return new ResponseItem('', 'Đăng xuất thành công');
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
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRETKEY'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES'),
      }),
    };

    return new ResponseItem(data, 'Làm mới token thành công');
  }

  async register(params: RegisterUserDto): Promise<ResponseItem<UserResponseDto>> {
    const user = await this.userService.create(params);

    const activationToken = this.jwtService.sign(
      { userId: user.id },
      {
        secret: this.configService.get<string>('JWT_ACTIVATE_SECRETKEY'),
        expiresIn: this.configService.get<string>('JWT_ACTIVATE_EXPIRES'),
      }
    );
    await this.sendActivationEmail(user.email, activationToken);

    return new ResponseItem(user, 'Đăng ký thành công', UserResponseDto);
  }

  async sendActivationEmail(email: string, token: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });

    const activationLink = `${this.configService.get('APP_URL')}/api/auth/activate?token=${token}`;

    await transporter.sendMail({
      from: 'no-reply@devplus.com',
      to: email,
      subject: 'Kích hoạt tài khoản DevPlus',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Kích hoạt tài khoản của bạn</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { width: 100%; max-width: 660px; margin: 20px auto; background-color: #ffffff; border: 1px solid #d1d1d1; border-radius: 8px; }
          .header { background-color: #1a73e8; color: #ffffff; text-align: center; padding: 15px; border-radius: 8px 8px 0 0; font-size: 20px; font-weight: bold; }
          .content { text-align: center; margin: 20px 0; }
          .btn { display: inline-block; background-color: #4285f4; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
          .footer { margin-top: 20px; text-align: center; font-size: 14px; color: #555555; margin-bottom: 20px; }
          p {color: #000000 !important; font-size: 18px !important; margin: 10px 0 !important; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Kích hoạt tài khoản của bạn</div>
          <div class="content">
            <p>Xin chào ${email}</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
            <p>Chỉ còn một bước nhỏ nữa thôi để bắt đầu trải nghiệm:</p>
            <p>Hãy xác nhận email của bạn bằng cách nhấn vào nút bên dưới nhé!</p>
            <a href="${activationLink}" class="btn">Kích hoạt tài khoản</a>
            <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
            <p>Nếu bạn không phải là người đăng ký, xin vui lòng bỏ qua email này.</p>
            <p>Chúng tôi rất mong chờ được đồng hành cùng bạn!<br>
            Nếu cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.</p>
            <p>Thân ái,<br>Đội ngũ DevPlus</p>
          </div>
          <div class="footer">© ${new Date().getFullYear()} DevPlus. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
    });
  }

  async activateAccount(token: string): Promise<ResponseItem<UserResponseDto>> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACTIVATE_SECRETKEY) as { userId: string };

      const user = await this.userService.findById(decoded.userId);
      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      if (user.status) {
        throw new BadRequestException('Tài khoản đã được kích hoạt trước đó');
      }

      const updateUser = await this.userService.updateUserStatus(user.id, true);

      return new ResponseItem(updateUser, 'Kích hoạt tài khoản thành công', UserResponseDto);
    } catch (error) {
      throw new BadRequestException('Mã kích hoạt không hợp lệ hoặc đã hết hạn');
    }
  }
}
