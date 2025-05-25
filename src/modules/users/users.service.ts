import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import * as fs from 'fs';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
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
import { UserProviderEnum } from '@Constant/index';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { GetUsersByAdminDto } from './dto/get-users-by-admin.dto.';
import { GetStatusSummaryDto } from './dto/get-status-summary.dto';
import { convertPath } from '@app/common/utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async create(params: CreateUserDto): Promise<UserResponseDto> {
    const emailExisted = await this.prisma.user.findUnique({
      where: { email: params.email },
    });

    if (emailExisted) throw new BadRequestException('Email đã tồn tại');

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

    const mappedResult = result.map((user) => ({
      ...user,
      dob: null,
      country: null,
      province: null,
      job: null,
      referralCode: null,
    }));

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: queries });

    return new ResponsePaginate(mappedResult, pageMetaDto, 'Lấy danh sách người dùng thành công');
  }

  async getStatusSummary(): Promise<ResponseItem<GetStatusSummaryDto>> {
    const [users, activates, unactivates] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          status: true,
        },
      }),
      this.prisma.user.count({
        where: {
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
}
