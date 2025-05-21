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
import { UserProviderEnum, UserRoleEnum } from '@Constant/index';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';

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
    params = { ...params, password: hashedPassword, status: true };

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: params.role },
    });

    if (!defaultRole) throw new Error(`Role mặc định ${params.role} chưa được tạo trong bảng Role`);
    const { role, ...userData } = params;

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
}
