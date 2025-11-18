import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { CourseResponseDto } from './dto/response/course-response.dto';
import { Prisma } from '@prisma/client';
import { RegisterCourseDto } from './dto/request/register-course.dto';
import { UserLearningProgressResponseDto } from './dto/response/user-learning-progress-response.dto';
import { plainToInstance } from 'class-transformer';
import { PaginatedSearchCourseDto } from './dto/request/paginated-search-course.dto';
import { title } from 'process';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { pathNameCommon } from '@Constant/url';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { GoogleCloudStorageService } from '@app/modules/google-cloud/google-cloud-storage.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleCloudStorageService: GoogleCloudStorageService
  ) {}

  async registerCourse(dto: RegisterCourseDto): Promise<ResponseItem<UserLearningProgressResponseDto>> {
    const { userId, courseId } = dto;

    try {
      const existing = await this.prisma.userLearningProgress.findFirst({
        where: { userId, courseId },
      });

      if (existing) {
        throw new ConflictException('Bạn đã đăng ký khóa học này rồi');
      }

      const progress = await this.prisma.userLearningProgress.create({
        data: {
          userId,
          courseId,
          startedAt: new Date(),
        },
      });

      const progressDto = plainToInstance(UserLearningProgressResponseDto, progress, {
        excludeExtraneousValues: true,
      });

      return new ResponseItem<UserLearningProgressResponseDto>(progressDto, 'Đăng ký khóa học thành công');
    } catch (error) {
      this.logger.error('Lỗi khi đăng ký khóa học:', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new BadRequestException('Lỗi khi đăng ký khóa học');
    }
  }

  async findAll(userId: string, excludeId?: string): Promise<ResponseItem<CourseResponseDto[]>> {
    try {
      const courses = await this.prisma.course.findMany({
        where: {
          isActive: true,
          ...(excludeId && { id: { not: excludeId } }),
        },
        include: {
          userProgress: {
            where: {
              userId: userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const coursesWithRegistrationStatus = courses.map((course) => {
        const { userProgress, ...courseData } = course;
        const isRegistered = userProgress.length > 0;

        return {
          ...courseData,
          isRegistered,
        };
      });

      const courseDtos = plainToInstance(CourseResponseDto, coursesWithRegistrationStatus, {
        excludeExtraneousValues: true,
      });

      return new ResponseItem<CourseResponseDto[]>(courseDtos, 'Lấy danh sách khóa học thành công');
    } catch (error) {
      this.logger.error('Error getting all courses:', error);
      throw new BadRequestException('Lỗi khi lấy danh sách khóa học');
    }
  }

  async findOne(courseId: string, userId: string): Promise<ResponseItem<CourseResponseDto>> {
    try {
      const course = await this.prisma.course.findUnique({
        where: {
          id: courseId,
          isActive: true,
        },
        include: {
          userProgress: {
            where: {
              userId: userId,
            },
          },
        },
      });

      if (!course) {
        throw new NotFoundException('Không tìm thấy khóa học');
      }

      const { userProgress, ...courseData } = course;
      const isRegistered = userProgress.length > 0;

      const courseWithRegistrationStatus = {
        ...courseData,
        isRegistered,
      };

      const courseDto = plainToInstance(CourseResponseDto, courseWithRegistrationStatus, {
        excludeExtraneousValues: true,
      });

      return new ResponseItem<CourseResponseDto>(courseDto, 'Lấy thông tin khóa học thành công');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Error getting course by id:', error);
      throw new BadRequestException('Lỗi khi lấy thông tin khóa học');
    }
  }

  async searchCoursesPaining(request: PaginatedSearchCourseDto): Promise<ResponsePaginate<CourseResponseDto>> {
    const { search, domains, status } = request;

    const where: Prisma.CourseWhereInput = {
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(domains && { domainId: { in: domains } }),
      isActive: status,
    };

    const [result, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          overview: true,
          description: true,
          courseInformation: true,
          contactInformation: true,
          applicableObjects: true,
          provider: true,
          url: true,
          linkImage: true,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        take: request.take,
        skip: request.skip,
      }),
      this.prisma.course.count({ where }),
    ]);

    const courseDtos = plainToInstance(CourseResponseDto, result, {
      excludeExtraneousValues: true,
    });

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: request });

    return new ResponsePaginate(courseDtos, pageMetaDto, 'Tim kiếm khóa học thành công');
  }

  private async uploadThumbnailImage(thumbnailUrl: Express.Multer.File): Promise<string> {
    try {
      const destPath = pathNameCommon('courses', `${uuidv4()}-${thumbnailUrl.originalname}`);
      const uploadedUrl = await this.googleCloudStorageService.uploadFile(thumbnailUrl, destPath);
      if (thumbnailUrl.path && fs.existsSync(thumbnailUrl.path)) fs.unlinkSync(thumbnailUrl.path);
      return uploadedUrl;
    } catch (error) {
      if (thumbnailUrl.path && fs.existsSync(thumbnailUrl.path)) fs.unlinkSync(thumbnailUrl.path);
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(`Lỗi upload file ${thumbnailUrl.originalname}: ${error.message}`);
    }
  }

  async createCourse(request: CreateCourseDto): Promise<ResponseItem<CourseResponseDto>> {
    try {
      const thumbnailUrl = await this.uploadThumbnailImage(request.thumbnailImage);
      const courseData: Omit<Prisma.CourseCreateInput, 'id' | 'isActive' | 'provider' | 'domain'> = {
        title: request.title,
        overview: request.overview,
        description: request.description,
        courseInformation: request.courseInformation,
        contactInformation: request.contactInformation,
        applicableObjects: request.applicableObjects,
        linkImage: thumbnailUrl,
        courseType: request.courseType.toString(),
        durationHours: request.durationHours,
      };

      const newCourse = await this.prisma.course.create({
        data: {
          ...courseData,
          isActive: true,
          provider: 'Dev Plus',
          domain: { connect: { id: request.domain } },
          sfiaLevels: { set: request.sfiaLevels },
        },
        select: {
          id: true,
          title: true,
          overview: true,
          description: true,
          courseInformation: true,
          contactInformation: true,
          applicableObjects: true,
          linkImage: true,
          courseType: true,
          durationHours: true,
          isActive: true,
          provider: true,
        },
      });

      await this.prisma.courseAspect.createMany({
        data: request.competencyAspects.map((aspectId) => ({
          courseId: newCourse.id,
          aspectId,
        })),
        skipDuplicates: true,
      });

      return new ResponseItem(
        plainToInstance(CourseResponseDto, newCourse, {
          excludeExtraneousValues: true,
        }),
        'Thêm mới chương trình học thành công'
      );
    } catch (error) {
      throw new BadRequestException('Lỗi khi tạo mới chương trình học');
    }
  }
}
