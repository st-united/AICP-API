import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { ResponseItem } from '@app/common/dtos';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@UsersModule/dto/request/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileDto } from './dto/profile.dto';
import { UserDto } from './dto/user.dto';
import { avtPathName } from '@Constant/url';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UserProviderEnum } from '@Constant/index';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { GoogleCloudStorageService } from '../google-cloud/google-cloud-storage.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly googleCloudStorageService: GoogleCloudStorageService
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

  async getProfile(id: string): Promise<ResponseItem<ProfileDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    return new ResponseItem(user, 'Thành công', ProfileDto);
  }

  async updateProfile(id: string, updateUserDto: UpdateProfileUserDto): Promise<ResponseItem<UserDto>> {
    const { email, referralCode, ...updateData } = updateUserDto;
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Thông tin cá nhân không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
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
}
