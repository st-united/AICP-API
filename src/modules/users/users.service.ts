import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import * as fs from 'fs';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { convertPath } from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@UsersModule/dto/request/create-user.dto';
import { GetUsersDto } from '@UsersModule/dto/get-users.dto';
import { UpdateUserDto } from '@UsersModule/dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserDto } from './dto/user.dto';
import { avtPathName, baseImageUrl } from '@Constant/url';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/response/user-response.dto';
import { JwtPayload } from '@Constant/types';
import { EmailService } from '@app/modules/email/email.service';
import { UserProviderEnum } from '@Constant/enums';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { UpdateForgotPasswordUserDto } from './dto/update-forgot-password';
import { TokenService } from '@app/modules/auth/services/token.service';
import { RedisService } from '@app/modules/redis/redis.service';
@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService
  ) {}

  async create(params: CreateUserDto): Promise<UserResponseDto> {
    const emailExisted = await this.prisma.user.findUnique({
      where: { email: params.email },
    });

    if (emailExisted) throw new BadRequestException('Email đã tồn tại');

    if (params.phoneNumber) {
      const phoneExisted = await this.prisma.user.findUnique({
        where: { phoneNumber: params.phoneNumber },
      });

      if (phoneExisted) throw new BadRequestException('Số điện thoại đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);
    params = { ...params, password: hashedPassword };

    const user = await this.prisma.user.create({
      data: {
        ...params,
        provider: UserProviderEnum.EMAIL,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        status: true,
        provider: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  async resetPassword(id: string): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const newPassword = await bcrypt.hash(this.configService.get<string>('RESET_PASSWORD'), 10);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { password: newPassword },
    });

    return new ResponseItem(
      { ...updatedUser, password: this.configService.get<string>('RESET_PASSWORD') },
      'Đặt lại mật khẩu thành công'
    );
  }

  async changePassword(id: string, data: ChangePasswordDto): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !bcrypt.compareSync(data.oldPassword, user.password)) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const password = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password },
    });

    return new ResponseItem(user, 'Thay đổi mật khẩu thành công');
  }

  async getUsers(params: GetUsersDto): Promise<ResponsePaginate<UserDto>> {
    const where = {
      status: params.status ? params.status : undefined,
      deletedAt: null,
    };

    const [result, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { [params.orderBy]: params.order },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.user.count({ where }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: params });

    return new ResponsePaginate(result, pageMetaDto, 'Thành công');
  }

  async getUser(id: string): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!user) throw new BadRequestException('Nhân viên không tồn tại');

    return new ResponseItem(
      { ...user, avatarUrl: user.avatarUrl ? baseImageUrl + convertPath(user.avatarUrl) : null },
      'Thành công'
    );
  }

  async getProfile(id: string): Promise<ResponseItem<ProfileDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    const result = plainToClass(
      ProfileDto,
      { ...user, avatarUrl: user.avatarUrl ? baseImageUrl + convertPath(user.avatarUrl) : null },
      { excludeExtraneousValues: true }
    );

    return new ResponseItem(result, 'Thành công');
  }

  async updateProfile(id: string, updateUserDto: UpdateProfileUserDto): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Thông tin cá nhân không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return new ResponseItem(updatedUser, 'Cập nhật dữ liệu thành công');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return new ResponseItem(updatedUser, 'Cập nhật dữ liệu thành công');
  }

  async deleteUser(id: string): Promise<ResponseItem<null>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.status) throw new BadRequestException('Không được xóa nhân viên đang hoạt động');

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return new ResponseItem(null, 'Xóa nhân viên thành công');
  }

  async uploadAvatar(id: string, file: Express.Multer.File): Promise<ResponseItem<any>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl: avtPathName('users', file.filename) },
    });

    if (fs.existsSync(user.avatarUrl)) {
      fs.unlinkSync(user.avatarUrl);
    }

    return new ResponseItem(updatedUser, 'Cập nhật thông tin thành công');
  }

  async removeAvatar(id: string): Promise<ResponseItem<any>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new BadRequestException('Nhân viên không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl: null },
    });

    if (fs.existsSync(user.avatarUrl)) {
      fs.unlinkSync(user.avatarUrl);
    }

    return new ResponseItem(updatedUser, 'Xóa ảnh đại diện thành công');
  }

  async findById(id: string): Promise<UserResponseDto> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUserStatus(id: string, status: boolean): Promise<string> {
    await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    return 'Cập nhật trạng thái thành công';
  }

  async sendForgotPassword(email: string): Promise<ResponseItem<boolean>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại!');
      }

      const payload: JwtPayload = { sub: user.id, email: user.email };

      const token: string = this.tokenService.generateAccessToken(payload);

      const ttl = parseInt(this.configService.get<string>('JWT_EXPIRED_TIME'));
      await this.redisService.setValue(`reset_password:${token}`, 'pending', ttl);

      await this.emailService.sendForgotPasswordEmail(user.fullName, user.email, token);

      return new ResponseItem(true, 'Gửi email thành công');
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra: ', { cause: error });
    }
  }

  async updateNewPassword(updateForgotPasswordUserDto: UpdateForgotPasswordUserDto): Promise<ResponseItem<boolean>> {
    try {
      const tokenStatus = await this.redisService.getValue(`reset_password:${updateForgotPasswordUserDto.token}`);

      if (!tokenStatus) {
        throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
      }

      const verifiedToken = this.tokenService.verifyAccessToken(updateForgotPasswordUserDto.token);
      const userId = verifiedToken.sub;

      const foundUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!foundUser) throw new BadRequestException('Người dùng không tồn tại');

      await this.redisService.deleteValue(`reset_password:${updateForgotPasswordUserDto.token}`);
      const hashedNewPassword = await bcrypt.hash(updateForgotPasswordUserDto.password, 10);

      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedNewPassword,
        },
      });

      return new ResponseItem(true, 'Đổi mật khẩu thành công!');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
      }
      throw new BadRequestException('Token không hợp lệ', { cause: error });
    }
  }

  async checkResetToken(token: string): Promise<ResponseItem<boolean>> {
    try {
      const tokenStatus = await this.redisService.getValue(`reset_password:${token}`);
      if (!tokenStatus) {
        throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
      }

      const verifiedToken = this.tokenService.verifyAccessToken(token);
      const userId = verifiedToken.sub;

      const foundUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!foundUser) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      return new ResponseItem(true, 'Link còn hiệu lực');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn');
      }
      throw new BadRequestException('Token không hợp lệ', { cause: error });
    }
  }
}
