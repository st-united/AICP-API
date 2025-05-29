import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@UsersModule/dto/request/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserDto } from './dto/user.dto';
import { avtPathName, baseImageUrl } from '@Constant/url';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/response/user-response.dto';
import { JwtPayload } from '@Constant/types';
import { EmailService } from '@app/modules/email/email.service';
import { UserProviderEnum, UserRoleEnum } from '@Constant/index';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { UpdateForgotPasswordUserDto } from './dto/update-forgot-password';
import { TokenService } from '@app/modules/auth/services/token.service';
import { GoogleCloudStorageService } from '../google-cloud/google-cloud-storage.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { GetUsersByAdminDto } from './dto/get-users-by-admin.dto';
import { GetStatusSummaryDto } from './dto/get-status-summary.dto';
import { convertPath } from '@app/common/utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly googleCloudStorageService: GoogleCloudStorageService
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

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: params.role },
    });

    if (!defaultRole) throw new BadRequestException(`Role mặc định ${params.role} chưa được tạo trong bảng Role`);

    const userData: Omit<Prisma.UserCreateInput, 'id' | 'roles'> = {
      email: params.email,
      fullName: params.fullName,
      phoneNumber: params.phoneNumber,
      password: hashedPassword,
    };

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        provider: UserProviderEnum.EMAIL,
        roles: {
          create: [
            {
              role: {
                connect: { id: defaultRole.id },
              },
            },
          ],
        },
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
      throw new BadRequestException('Người dùng không tồn tại');
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

  async getUsers(queries: GetUsersByAdminDto): Promise<ResponsePaginate<UserDto>> {
    const where: Prisma.UserWhereInput = {
      ...(queries.search && {
        fullName: {
          contains: queries.search,
          mode: 'insensitive',
        },
      }),
      status: queries.status,
      ...(queries.job && {
        job: queries.job,
      }),
      ...(queries.province && {
        province: queries.province,
      }),
      createdAt: {
        gte: queries.startDate ? new Date(queries.startDate) : undefined,
        lte: queries.endDate ? new Date(queries.endDate) : undefined,
      },
      roles: {
        some: {
          role: {
            name: 'user',
          },
        },
      },
    };

    const [result, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          fullName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          province: true,
          country: true,
          dob: true,
          job: true,
          referralCode: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: queries.skip,
        take: queries.take,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: queries });

    return new ResponsePaginate(result, pageMetaDto, 'Lấy danh sách người dùng thành công');
  }

  async getStatusSummary(): Promise<ResponseItem<GetStatusSummaryDto>> {
    const where: Prisma.UserWhereInput = {
      roles: {
        some: {
          role: {
            name: 'user',
          },
        },
      },
    };

    const [users, activates, unactivates] = await this.prisma.$transaction([
      this.prisma.user.count({
        where,
      }),
      this.prisma.user.count({
        where: {
          ...where,
          status: true,
        },
      }),
      this.prisma.user.count({
        where: {
          ...where,
          status: false,
        },
      }),
    ]);

    const data = {
      users,
      activates,
      unactivates,
    };

    return new ResponseItem(data);
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

    return new ResponseItem(user, 'Thành công', ProfileDto);
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

    return new ResponseItem(updatedUser, 'Cập nhật dữ liệu thành công', UserDto);
  }

  async uploadAvatar(id: string, file: Express.Multer.File): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new BadRequestException('Thông tin cá nhân không tồn tại');
    }

    if (user.avatarUrl) {
      const oldDest = this.googleCloudStorageService.getFileDestFromPublicUrl(user.avatarUrl);
      await this.googleCloudStorageService.deleteFile(oldDest);
    }
    const destPath = avtPathName('avatars', uuidv4());
    const avatarUrl = await this.googleCloudStorageService.uploadFile(file, destPath);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return new ResponseItem(updatedUser, 'Cập nhật thông tin thành công', UserDto);
  }

  async removeAvatar(id: string): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl: null },
    });

    if (fs.existsSync(user.avatarUrl)) {
      fs.unlinkSync(user.avatarUrl);
    }

    return new ResponseItem(updatedUser, 'Xóa ảnh đại diện thành công', UserDto);
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

      await this.emailService.sendForgotPasswordEmail(user.fullName, user.email, token);

      return new ResponseItem(true, 'Gửi email thành công');
    } catch (error) {
      throw new BadRequestException('Cauth a error: ', { cause: error });
    }
  }

  async updateNewPassword(updateForgotPasswordUserDto: UpdateForgotPasswordUserDto): Promise<ResponseItem<boolean>> {
    try {
      const verifiedToken = this.tokenService.verifyAccessToken(updateForgotPasswordUserDto.token);

      const userId = verifiedToken.sub;

      const foundUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!foundUser) throw new BadRequestException('Người dùng không tồn tại');

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
      throw new BadRequestException('Invalid or expired token', { cause: error });
    }
  }
}
