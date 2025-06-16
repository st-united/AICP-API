import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { RedisService } from '@app/modules/redis/redis.service';
import { GetPortfolioResponseDto } from './dto/get-portfolio-response.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Response } from 'express';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
const FILE_LIMITS = {
  fileSize: 5 * 1024 * 1024,
  files: 40,
  maxCount: 20,
};

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly googleCloudStorageService: GoogleCloudStorageService,
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

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: params.role },
    });

    if (!defaultRole) throw new BadRequestException(`Role mặc định ${params.role} chưa được tạo trong bảng Role`);

    const userData: Omit<Prisma.UserCreateInput, 'id' | 'roles'> = {
      email: params.email,
      fullName: params.fullName,
      phoneNumber: params.phoneNumber,
      dob: params.dob,
      password: hashedPassword,
      status: defaultRole.name === UserRoleEnum.MENTOR ? true : false,
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

    const [users, statusCounts] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }) as any,
    ]);

    const activates = statusCounts.find((item: { status: boolean }) => item.status === true)?._count?.status || 0;
    const unactivates = statusCounts.find((item: { status: boolean }) => item.status === false)?._count?.status || 0;

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

  async uploadPortfolioFiles(userId: string, file: Express.Multer.File): Promise<ResponseItem<string>> {
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('Người dùng không tồn tại');
    }

    try {
      const destPath = avtPathName('portfolio', `${uuidv4()}+${file.originalname}`);
      const url = await this.googleCloudStorageService.uploadFile(file, destPath);
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);

      return new ResponseItem<string>(url, 'Upload file thành công');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Upload file không thành công: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePortfolio(
    userId: string,
    portfolioDto: UpdatePortfolioDto
  ): Promise<ResponseItem<GetPortfolioResponseDto>> {
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { portfolio: true },
    });

    if (!user) {
      throw new ForbiddenException('Người dùng không tồn tại');
    }

    try {
      const portfolio = await this.prisma.portfolio.upsert({
        where: { userId },
        create: {
          linkedInUrl: portfolioDto.linkedInUrl,
          githubUrl: portfolioDto.githubUrl,
          certifications: portfolioDto.certifications || [],
          experiences: portfolioDto.experiences || [],
          userId,
        },
        update: {
          linkedInUrl: portfolioDto.linkedInUrl,
          githubUrl: portfolioDto.githubUrl,
          certifications: portfolioDto.certifications || [],
          experiences: portfolioDto.experiences || [],
        },
      });

      return new ResponseItem(portfolio, 'Hồ sơ cập nhật thành công', GetPortfolioResponseDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Cập nhật hồ sơ không thành công: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPortfolio(userId: string): Promise<ResponseItem<GetPortfolioResponseDto>> {
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('Người dùng không tồn tại');
    }

    const portfolio = await this.prisma.portfolio.findUnique({ where: { userId } });

    if (!portfolio) {
      throw new NotFoundException('Hồ sơ không tồn tại');
    }

    return new ResponseItem(portfolio, 'Lấy hồ sơ thành công', GetPortfolioResponseDto);
  }

  async downloadFile(url: string, filename: string, res: Response): Promise<void> {
    if (!url || !filename) {
      throw new BadRequestException('URL and filename are required');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new HttpException('Failed to fetch file', HttpStatus.BAD_REQUEST);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
      res.send(buffer);
    } catch (error) {
      throw new HttpException(`Error downloading file: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
