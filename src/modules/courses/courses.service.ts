import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseItem } from '@app/common/dtos';
import { CourseResponseDto } from './dto/response/course-response.dto';
import { Prisma } from '@prisma/client';
import { RegisterCourseDto } from './dto/request/register-course.dto';
import { UserLearningProgressResponseDto } from './dto/response/user-learning-progress-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(userId: string): Promise<ResponseItem<CourseResponseDto[]>> {
    try {
      const courses = await this.prisma.course.findMany({
        where: {
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
}
