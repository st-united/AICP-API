import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
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
import { CACHE_TTL_SECONDS, LEADERBOARD_KEY, TOTAL_USERS_KEY, UserProviderEnum, UserRoleEnum } from '@Constant/index';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { UpdateForgotPasswordUserDto } from './dto/update-forgot-password';
import { TokenService } from '@app/modules/auth/services/token.service';
import { GoogleCloudStorageService } from '../google-cloud/google-cloud-storage.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, User, UserTrackingStatus, MentorBookingStatus, TimeSlotBooking } from '@prisma/client';
import { GetUsersByAdminDto } from './dto/get-users-by-admin.dto';
import { GetStatusSummaryDto } from './dto/get-status-summary.dto';
import { convertPath } from '@app/common/utils';
import { RedisService } from '@app/modules/redis/redis.service';
import { GetPortfolioResponseDto } from './dto/get-portfolio-response.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import {
  validatePortfolioFiles,
  validatePortfolioRequest,
  validateDeletedFiles,
} from '@app/validations/portfolio-validation';
import { Response } from 'express';
import * as sharp from 'sharp';
import { UpdateStudentInfoDto } from './dto/request/update-student-info.dto';
import { CurrentUserRankingDto, RankingUserDto } from './dto/ranking-user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RankingResponseDto } from './dto/response/ranking-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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
    const jobFilter = queries['job[]'];
    const provinceFilter = queries['province[]'];
    const where: Prisma.UserWhereInput = {
      ...(queries.search && {
        fullName: {
          contains: queries.search,
          mode: 'insensitive',
        },
      }),
      status: queries.status,
      ...(jobFilter &&
        jobFilter.length > 0 && {
          job: {
            some: {
              id: {
                in: jobFilter,
              },
            },
          },
        }),
      ...(provinceFilter &&
        provinceFilter.length > 0 && {
          province: {
            in: provinceFilter,
          },
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
      this.prisma.user.count({ where }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
        where,
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        job: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const mappedUser = {
      ...user,
      roles: user.roles.map(({ role }) => ({
        id: role.id,
        name: role.name,
      })),
    };

    return new ResponseItem(mappedUser, 'Thành công', ProfileDto);
  }

  async updateProfile(id: string, updateUserDto: UpdateProfileUserDto): Promise<ResponseItem<UserDto>> {
    const { email, referralCode, job, isStudent, studentCode, university, ...updateData } = updateUserDto;

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Thông tin cá nhân không tồn tại');
    }

    if (updateData.phoneNumber) {
      if (user.phoneNumber === updateData.phoneNumber) {
        delete updateData.phoneNumber;
      } else {
        const phoneExisted = await this.prisma.user.findUnique({
          where: { phoneNumber: updateData.phoneNumber },
        });

        if (phoneExisted) {
          throw new BadRequestException('Số điện thoại đã tồn tại');
        }

        if (user.zaloVerified) {
          updateData['zaloVerified'] = false;
        } else {
          const otpKey = this.configService.get<string>('OTP_KEY_PREFIX') + user.id + ':' + user.phoneNumber;
          await this.redisService.deleteValue(otpKey);
        }
      }
    }

    if (isStudent) {
      if (studentCode) {
        if (user.studentCode !== studentCode) {
          const studentCodeExisted = await this.prisma.user.findFirst({
            where: {
              studentCode,
              id: { not: id }, // loại trừ chính user hiện tại
            },
          });

          if (studentCodeExisted) {
            throw new BadRequestException('Mã sinh viên đã tồn tại');
          }

          updateData['studentCode'] = studentCode;
        }
      } else {
        throw new BadRequestException('Mã sinh viên là bắt buộc');
      }

      if (university) {
        updateData['university'] = university;
      } else {
        throw new BadRequestException('Tên trường là bắt buộc');
      }

      updateData['isStudent'] = true;
    } else {
      updateData['isStudent'] = false;
      updateData['studentCode'] = null;
      updateData['university'] = null;
    }

    const updateDataWithJob: any = { ...updateData };

    if (job !== undefined && job !== null) {
      const domainIds = Array.isArray(job) ? job : typeof job === 'string' ? [job] : [];
      updateDataWithJob.job = {
        set: domainIds.map((domainId) => ({ id: domainId })),
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateDataWithJob,
      include: {
        job: true,
      },
    });

    return new ResponseItem(updatedUser, 'Cập nhật hồ sơ thành công', UserDto);
  }

  async uploadAvatar(id: string, file: Express.Multer.File): Promise<ResponseItem<UserDto>> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new BadRequestException('Thông tin cá nhân không tồn tại');
    }

    const resizedBuffer = await sharp(file.buffer).resize(512, 512, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();

    if (resizedBuffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Ảnh vượt quá kích thước tối đa 5MB sau khi xử lý');
    }

    if (user.avatarUrl) {
      const oldDest = this.googleCloudStorageService.getFileDestFromPublicUrl(user.avatarUrl);
      await this.googleCloudStorageService.deleteFile(oldDest);
    }

    const destPath = avtPathName('avatars', uuidv4());
    const avatarUrl = await this.googleCloudStorageService.uploadBuffer(resizedBuffer, destPath, 'image/jpeg');

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
      include: { job: true },
    });

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
      include: { job: true },
    });

    if (fs.existsSync(user.avatarUrl)) {
      fs.unlinkSync(user.avatarUrl);
    }

    return new ResponseItem(updatedUser, 'Xóa ảnh đại diện thành công', UserDto);
  }

  async findById(id: string): Promise<UserResponseDto> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUserStatus(id: string, status: boolean, statusTracking: UserTrackingStatus): Promise<string> {
    await this.prisma.user.update({
      where: { id },
      data: { status, statusTracking },
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

  private async processFiles(
    files: Express.Multer.File[],
    basePath: string,
    existingFiles: string[] = []
  ): Promise<string[]> {
    if (!files?.length) return existingFiles;

    const uploadPromises = files.map(async (file) => {
      const destPath = avtPathName(`${basePath}/`, `${uuidv4()}+${file.originalname}`);
      try {
        const url = await this.googleCloudStorageService.uploadFile(file, destPath);
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return url;
      } catch (error) {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        if (error instanceof HttpException) throw error;
        throw new BadRequestException(`Lỗi upload file ${file.originalname}: ${error.message}`);
      }
    });

    return [...existingFiles, ...(await Promise.all(uploadPromises))];
  }

  private filterDeletedItems(items: string[] = [], deletedItems?: string[]): string[] {
    return deletedItems?.length ? items.filter((item) => !deletedItems.includes(item)) : items;
  }

  async updatePortfolio(
    userId: string,
    portfolioDto: UpdatePortfolioDto
  ): Promise<ResponseItem<GetPortfolioResponseDto>> {
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }
    validatePortfolioRequest(
      portfolioDto.certificateFiles,
      portfolioDto.experienceFiles,
      portfolioDto.deleted_certifications,
      portfolioDto.deleted_experiences,
      portfolioDto.linkedInUrl,
      portfolioDto.githubUrl,
      portfolioDto.portfolioUrl,
      portfolioDto.developmentFocusAnswer,
      portfolioDto.isStudent
    );

    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      try {
        validatePortfolioFiles(portfolioDto.certificateFiles, portfolioDto.experienceFiles);

        const [certificateFiles, experienceFiles] = await Promise.all([
          this.processFiles(portfolioDto.certificateFiles, 'certifications', []),
          this.processFiles(portfolioDto.experienceFiles, 'experiences', []),
        ]);

        const newPortfolio = await this.prisma.portfolio.create({
          data: {
            linkedInUrl: portfolioDto.linkedInUrl,
            githubUrl: portfolioDto.githubUrl,
            portfolioUrl: portfolioDto.portfolioUrl,
            developmentFocusAnswer: portfolioDto.developmentFocusAnswer,
            certificateFiles,
            experienceFiles,
            userId,
          },
        });

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            statusTracking: UserTrackingStatus.PROFILE_COMPLETED,
          },
        });

        return new ResponseItem(newPortfolio, 'Hồ sơ tạo thành công', GetPortfolioResponseDto);
      } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(`Tạo hồ sơ không thành công: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const uploadCertifications = portfolioDto.certificateFiles;
    const uploadExperiences = portfolioDto.experienceFiles;

    try {
      validatePortfolioFiles(uploadCertifications, uploadExperiences);

      if (portfolioDto.deleted_certifications?.length || portfolioDto.deleted_experiences?.length) {
        validateDeletedFiles(
          portfolioDto.deleted_certifications || [],
          portfolioDto.deleted_experiences || [],
          portfolio.certificateFiles || [],
          portfolio.experienceFiles || []
        );
      }

      const deletePromises: Promise<void>[] = [];

      if (portfolioDto.deleted_certifications?.length && portfolio.certificateFiles?.length) {
        const filesToDelete = portfolioDto.deleted_certifications.filter((deletedFile) =>
          portfolio.certificateFiles.includes(deletedFile)
        );

        deletePromises.push(
          ...filesToDelete.map(async (deletedFile) => {
            try {
              const destFileName = this.googleCloudStorageService.getFileDestFromPublicUrl(deletedFile);
              await this.googleCloudStorageService.deleteFile(destFileName);
            } catch (error) {
              console.error(`Lỗi khi xóa file certification: ${deletedFile}`, error);
            }
          })
        );
      }

      if (portfolioDto.deleted_experiences?.length && portfolio.experienceFiles?.length) {
        const filesToDelete = portfolioDto.deleted_experiences.filter((deletedFile) =>
          portfolio.experienceFiles.includes(deletedFile)
        );

        deletePromises.push(
          ...filesToDelete.map(async (deletedFile) => {
            try {
              const destFileName = this.googleCloudStorageService.getFileDestFromPublicUrl(deletedFile);
              await this.googleCloudStorageService.deleteFile(destFileName);
            } catch (error) {
              console.error(`Lỗi khi xóa file experience: ${deletedFile}`, error);
            }
          })
        );
      }

      const [certificateFiles, experienceFiles] = await Promise.all([
        this.processFiles(
          uploadCertifications,
          'certifications',
          this.filterDeletedItems(portfolio.certificateFiles, portfolioDto.deleted_certifications)
        ),
        this.processFiles(
          uploadExperiences,
          'experiences',
          this.filterDeletedItems(portfolio.experienceFiles, portfolioDto.deleted_experiences)
        ),
        Promise.all(deletePromises),
      ]);

      const updatedPortfolio = await this.prisma.portfolio.update({
        where: { userId },
        data: {
          linkedInUrl: portfolioDto.linkedInUrl,
          githubUrl: portfolioDto.githubUrl,
          portfolioUrl: portfolioDto.portfolioUrl,
          developmentFocusAnswer: portfolioDto.developmentFocusAnswer,
          certificateFiles,
          experienceFiles,
        },
      });

      if (portfolioDto.isStudent === 'true') {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            university: portfolioDto.university,
            studentCode: portfolioDto.studentCode,
            isStudent: true,
          },
        });
      } else if (portfolioDto.isStudent === 'false') {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            university: null,
            studentCode: null,
            isStudent: false,
          },
        });
      }

      const hasAnyField =
        Boolean(portfolioDto.linkedInUrl?.trim()) ||
        Boolean(portfolioDto.githubUrl?.trim()) ||
        (Array.isArray(certificateFiles) && certificateFiles.length > 0) ||
        (Array.isArray(experienceFiles) && experienceFiles.length > 0);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          statusTracking: hasAnyField ? UserTrackingStatus.PROFILE_COMPLETED : UserTrackingStatus.PROFILE_PENDING,
        },
      });

      return new ResponseItem(updatedPortfolio, 'Hồ sơ cập nhật thành công', GetPortfolioResponseDto);
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
      throw new BadRequestException('URL và filename không được để trống');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new HttpException('Không thể tải file', HttpStatus.BAD_REQUEST);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
      res.send(buffer);
    } catch (error) {
      throw new HttpException(`Lỗi tải file: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async updateStudentInfo(userId: string, updateStudentInfoDto: UpdateStudentInfoDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        university: updateStudentInfoDto.university,
        studentCode: updateStudentInfoDto.studentCode,
        isStudent: updateStudentInfoDto.isStudent,
      },
    });
    return new ResponseItem(updatedUser, 'Cập nhật thông tin thành công');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleRankingRefresh() {
    try {
      await this.refreshRankingData();
      this.logger.log('Leaderboard refreshed successfully');
    } catch (error) {
      this.logger.error('Failed to refresh leaderboard', error.stack);
    }
  }

  private async refreshRankingData(): Promise<{ topRanking: RankingUserDto[]; totalUsers: number }> {
    const users = await this.prisma.user.findMany({
      where: { roles: { some: { role: { name: UserRoleEnum.USER } } } },
      select: { id: true, fullName: true, avatarUrl: true },
      take: 10,
    });

    const totalUsers = await this.prisma.user.count({
      where: { roles: { some: { role: { name: UserRoleEnum.USER } } } },
    });

    const rankedUsers = users
      .map((u) => ({ ...u, score: Math.floor(Math.random() * 1000) + 100 }))
      .sort((a, b) => b.score - a.score)
      .map((u, idx) => ({ rank: idx + 1, ...u }));

    await Promise.all([
      this.redisService.setValue(LEADERBOARD_KEY, JSON.stringify(rankedUsers), CACHE_TTL_SECONDS),
      this.redisService.setValue(TOTAL_USERS_KEY, totalUsers.toString(), CACHE_TTL_SECONDS),
    ]);

    return { topRanking: rankedUsers, totalUsers };
  }

  async getRanking(currentUserId: string): Promise<ResponseItem<RankingResponseDto>> {
    let cachedLeaderboard: string | null = null;
    let cachedTotal: string | null = null;

    try {
      [cachedLeaderboard, cachedTotal] = await Promise.all([
        this.redisService.getValue(LEADERBOARD_KEY),
        this.redisService.getValue(TOTAL_USERS_KEY),
      ]);
    } catch (err) {
      this.logger.warn('Failed to fetch leaderboard from Redis, regenerating', err.stack);
    }

    let topRanking: RankingUserDto[] = [];
    let totalUsers = 0;

    try {
      if (cachedLeaderboard && cachedTotal) {
        topRanking = JSON.parse(cachedLeaderboard) as RankingUserDto[];
        totalUsers = parseInt(cachedTotal, 10);
      } else {
        throw new Error('Cache missing or incomplete');
      }
    } catch (err) {
      this.logger.warn('Redis cache corrupted or missing, regenerating leaderboard', err.stack);
      const fresh = await this.refreshRankingData();
      topRanking = fresh.topRanking;
      totalUsers = fresh.totalUsers;
    }

    const userInBoard = topRanking.find((u) => u.id === currentUserId);

    let currentUser: CurrentUserRankingDto;

    if (userInBoard) {
      currentUser = {
        userId: userInBoard.id,
        rank: userInBoard.rank,
        score: userInBoard.score,
      };
    } else {
      const lastScore = topRanking[topRanking.length - 1]?.score ?? 0;
      const fakeScore = Math.max(lastScore - 1, 0);

      currentUser = {
        userId: currentUserId,
        rank: topRanking.length + 1,
        score: fakeScore,
      };
    }

    return new ResponseItem<RankingResponseDto>({
      totalUsers,
      topRanking,
      currentUser,
    });
  }
}
