import { UsersService } from '@UsersModule/users.service';
import { generateSecurePassword } from '@app/common/helpers/randomPassword';
import { ExamStatus, ExamLevelEnum, InterviewRequestStatus, MentorBookingStatus, Prisma } from '@prisma/client';
import { TokenService } from '../auth/services/token.service';
import { PaginatedMentorBookingResponseDto } from './dto/response/paginated-booking-response.dto';
import { plainToInstance } from 'class-transformer';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMentorBookingDto } from './dto/request/create-mentor-booking.dto';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { FilterMentorBookingDto } from './dto/request/filter-mentor-booking.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import {
  MentorBookingResponseDto,
  MentorBookingResponseDto as MentorBookingResponseV1,
  MentorDto,
} from './dto/response/mentor-booking.dto';
import { MentorBookingResponseDto as MentorBookingResponseV2 } from './dto/response/mentor-booking-response.dto';
import { MentorBookingFilter } from './interface/mentorBookingFilter.interface';
import { AssignMentorDto } from './dto/response/assign-mentor.dto';
import { AssignMentorResultDto } from './dto/response/assign-mentor-result.dto';
import { InterviewShift, Order, MentorSpotStatus } from '@Constant/enums';
import { CheckInterviewRequestResponseDto } from './dto/response/check-interview-request-response.dto';
import { SearchMentorRequestDto } from '@app/modules/mentors/dto/request/search-mentor-request.dto';
import { GetBookingByMentorRequestDto } from '@app/modules/mentors/dto/request/get-booking-by-mentor-request.dto';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { GoogleCalendarService } from '@app/common/helpers/google-calendar.service';

@Injectable()
export class MentorsService {
  private readonly logger = new Logger(MentorsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService
  ) {}

  async create(createMentorDto: CreateMentorDto, url: string): Promise<ResponseItem<MentorResponseDto>> {
    const password = generateSecurePassword();
    const { expertise, maxMentees, ...userData } = createMentorDto;
    const createUser = await this.userService.create({ ...userData, password });
    try {
      const mentor = await this.prisma.mentor.create({
        data: {
          userId: createUser.id,
          expertise: expertise,
          maxMentees: maxMentees ?? 5,
          isActive: false,
        },
      });
      const token = this.tokenService.generateActivationToken(mentor.id);
      const emailContent = {
        fullName: createUser.fullName,
        email: createUser.email,
        password,
        token,
        url,
      };
      await this.redisService.setValue(`active_mentor:${emailContent.token}`, 'true');
      this.emailService.sendEmailNewMentor(emailContent);

      return new ResponseItem(mentor, 'Tạo mentor thành công', MentorResponseDto);
    } catch (error) {
      throw new BadRequestException('Lỗi khi tạo mentor');
    }
  }

  async getMentorsByParams(queries: SearchMentorRequestDto): Promise<ResponsePaginate<MentorDto>> {
    try {
      const where: Prisma.MentorWhereInput = {
        ...(queries.search && {
          user: {
            fullName: {
              contains: queries.search,
              mode: 'insensitive',
            },
          },
        }),
        isActive: queries.status,
      };

      const [results, total] = await this.prisma.$transaction([
        this.prisma.mentor.findMany({
          where,
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                phoneNumber: true,
              },
            },
            isActive: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: Order.DESC,
          },
          skip: queries.skip,
          take: queries.take,
        }),
        this.prisma.mentor.count({
          where,
        }),
      ]);

      const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: queries });

      if (!results || results.length === 0) {
        return new ResponsePaginate<MentorDto>([], pageMetaDto, 'Lấy danh sách mentor thành công');
      }

      const mentorIds = results.map((m) => m.id);

      const upcomingCounts = await this.prisma.mentorBooking.groupBy({
        by: ['mentorId'],
        where: {
          mentorId: { in: mentorIds },
          status: MentorBookingStatus.UPCOMING,
        },
        _count: { mentorId: true },
      });

      const completedCounts = await this.prisma.mentorBooking.groupBy({
        by: ['mentorId'],
        where: {
          mentorId: { in: mentorIds },
          status: MentorBookingStatus.COMPLETED,
        },
        _count: { mentorId: true },
      });

      const upcomingMap = Object.fromEntries(upcomingCounts.map((x) => [x.mentorId, x._count.mentorId]));

      const completedMap = Object.fromEntries(completedCounts.map((x) => [x.mentorId, x._count.mentorId]));

      const mentors: MentorDto[] = results.map((mentor) => ({
        id: mentor.id,
        fullName: mentor.user.fullName,
        phoneNumber: mentor.user.phoneNumber,
        email: mentor.user.email,
        isActive: mentor.isActive,
        totalUpcoming: upcomingMap[mentor.id] ?? 0,
        totalCompleted: completedMap[mentor.id] ?? 0,
        createdAt: mentor.createdAt,
      }));

      return new ResponsePaginate<MentorDto>(mentors, pageMetaDto, 'Lấy danh sách mentor thành công');
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy danh sách mentor');
    }
  }

  async getMentor(id: string): Promise<ResponseItem<MentorResponseDto>> {
    try {
      const mentor = await this.prisma.mentor.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      if (!mentor) {
        throw new NotFoundException('Không tìm thấy mentor');
      }

      return new ResponseItem(mentor, 'Lấy thông tin mentor thành công', MentorResponseDto);
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy thông tin mentor');
    }
  }

  async getMentorStats(): Promise<ResponseItem<MentorStatsDto>> {
    try {
      const [total, active, inactive] = await this.prisma.$transaction([
        this.prisma.mentor.count(),
        this.prisma.mentor.count({ where: { isActive: true } }),
        this.prisma.mentor.count({ where: { isActive: false } }),
      ]);

      const mentorStats = {
        totalMentors: total,
        activeMentors: active,
        inactiveMentors: inactive,
      };

      return new ResponseItem(mentorStats, 'Lấy thống kê mentor thành công', MentorStatsDto);
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy thống kê mentor');
    }
  }

  async updateMentor(id: string, updateMentorDto: UpdateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    const existingMentor = await this.prisma.mentor.findFirst({
      where: { id },
    });

    if (!existingMentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    try {
      return await this.prisma.$transaction(async (transactionClient) => {
        const userUpdateData: Omit<Prisma.UserUpdateInput, 'password'> = {
          fullName: updateMentorDto.fullName,
          phoneNumber: updateMentorDto.phoneNumber,
          avatarUrl: updateMentorDto.avatarUrl,
          dob: updateMentorDto.dob,
        };

        await transactionClient.user.update({
          where: { id: existingMentor.userId },
          data: userUpdateData,
        });

        const updatedMentor = await transactionClient.mentor.update({
          where: { id },
          data: {
            expertise: updateMentorDto.expertise,
            isActive: updateMentorDto.isActive,
          },
          include: {
            user: true,
          },
        });

        return new ResponseItem(updatedMentor, 'Cập nhật mentor thành công', MentorResponseDto);
      });
    } catch (error) {
      throw new BadRequestException('Lỗi khi cập nhật mentor');
    }
  }

  private async toggleMentorAccountStatus(id: string, activate: boolean, url: string): Promise<ResponseItem<null>> {
    const existingMentor = await this.prisma.mentor.findFirst({
      where: { id },
      select: {
        id: true,
        isActive: true,
        user: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: {
                  in: [MentorBookingStatus.UPCOMING],
                },
              },
            },
          },
        },
      },
    });

    if (!existingMentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    if (existingMentor.isActive === activate) {
      throw new ConflictException(`Mentor đã ${activate ? 'được kích hoạt' : 'bị vô hiệu hóa'}`);
    }

    if (!activate && existingMentor._count.bookings > 0) {
      throw new ConflictException('Không thể  vô hiệu hóa tài khoản mentor đã có lịch hẹn');
    }

    try {
      await this.prisma.mentor.update({
        where: { id },
        data: {
          isActive: activate,
        },
      });

      const emailContent = {
        fullName: existingMentor.user.fullName,
        email: existingMentor.user.email,
        url,
      };

      if (activate) {
        await this.emailService.sendEmailActivateMentorAccount(emailContent);
        return new ResponseItem(null, 'Kích hoạt tài khoản mentor thành công');
      } else {
        await this.emailService.sendEmailDeactivateMentorAccount(emailContent);
        return new ResponseItem(null, 'Xóa mentor thành công');
      }
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(`Lỗi khi ${activate ? 'kích hoạt' : 'xóa'} mentor`);
    }
  }

  async deactivateMentorAccount(id: string, url: string): Promise<ResponseItem<null>> {
    return this.toggleMentorAccountStatus(id, false, url);
  }

  async activateMentorAccount(id: string, url: string): Promise<ResponseItem<null>> {
    return this.toggleMentorAccountStatus(id, true, url);
  }

  async createScheduler(userId: string, dto: CreateMentorBookingDto): Promise<ResponseItem<any>> {
    try {
      const existing = await this.prisma.interviewRequest.findFirst({
        where: { examId: dto.examId },
      });

      if (existing) {
        throw new BadRequestException('Bài kiểm tra này đã được đặt lịch phỏng vấn.');
      }

      const exam = await this.prisma.exam.findUnique({
        where: { id: dto.examId },
      });

      if (!exam || exam.userId !== userId) {
        throw new BadRequestException('Bài thi không hợp lệ');
      }

      const interviewRequest = await this.prisma.interviewRequest.create({
        data: {
          examId: dto.examId,
          status: InterviewRequestStatus.PENDING,
        },
      });

      const startAt = new Date(dto.startAt);
      const endAt = new Date(dto.endAt);

      if (endAt <= startAt) {
        throw new BadRequestException('Thời gian phỏng vấn không hợp lệ');
      }

      const mentor = await this.prisma.mentor.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!mentor) {
        throw new BadRequestException('Không có mentor khả dụng');
      }

      const spot = await this.prisma.mentorTimeSpot.create({
        data: {
          mentorId: mentor.id,
          startAt,
          endAt,
          durationMinutes: Math.floor((endAt.getTime() - startAt.getTime()) / 60000),
          timezone: 'Asia/Ho_Chi_Minh',
          status: MentorSpotStatus.BOOKED,
        },
      });
      await this.prisma.$transaction([
        this.prisma.interviewRequest.update({
          where: { id: interviewRequest.id },
          data: {
            currentSpotId: spot.id,
            status: InterviewRequestStatus.ASSIGNED,
          },
        }),
        this.prisma.mentorBooking.create({
          data: {
            mentorId: mentor.id,
            interviewRequestId: interviewRequest.id,
            status: MentorBookingStatus.UPCOMING,
          },
        }),
        this.prisma.exam.update({
          where: { id: dto.examId },
          data: {
            examStatus: ExamStatus.INTERVIEW_SCHEDULED,
          },
        }),
      ]);

      return new ResponseItem(null, 'Đặt lịch phỏng vấn thành công');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(error);
      throw new BadRequestException('Đặt lịch phỏng vấn thất bại');
    }
  }

  async activateAccountByMentor(token: string, url: string): Promise<ResponseItem<null>> {
    try {
      const redisToken = await this.redisService.getValue(`active_mentor:${token}`);
      if (!redisToken) {
        throw new BadRequestException('Link kích hoạt không hợp lệ hoặc đã hết hạn');
      }

      const mentorId = this.tokenService.verifyActivationToken(token);

      const foundMentor = await this.prisma.mentor.findUnique({
        where: {
          id: mentorId,
        },
      });

      if (!foundMentor) {
        throw new BadRequestException('Cố vấn không tồn tại');
      }

      await this.activateMentorAccount(mentorId, url);
      await this.redisService.deleteValue(`active_mentor:${token}`);
      return new ResponseItem(null, 'Kích hoạt tài khoản thành công');
    } catch (error) {
      throw new BadRequestException('Mã kích hoạt không hợp lệ hoặc đã hết hạn', error.message);
    }
  }

  async checkUserInterviewRequest(examId: string): Promise<ResponseItem<CheckInterviewRequestResponseDto>> {
    try {
      if (!examId) {
        throw new BadRequestException('id bộ đề là bắt buộc');
      }
      const interviewRequest = await this.prisma.interviewRequest.findFirst({
        where: { examId },
        include: { currentSpot: true },
        orderBy: { createdAt: Order.DESC },
      });

      const response: CheckInterviewRequestResponseDto = {
        hasInterviewRequest: !!interviewRequest,
        interviewRequest: interviewRequest
          ? {
              id: interviewRequest.id,
              examId: interviewRequest.examId,
              startAt: interviewRequest.currentSpot?.startAt,
              endAt: interviewRequest.currentSpot?.endAt,
              status: interviewRequest.status,
            }
          : undefined,
      };

      return new ResponseItem(
        response,
        interviewRequest ? 'Người dùng đã có lịch phỏng vấn' : 'Người dùng chưa có lịch phỏng vấn',
        CheckInterviewRequestResponseDto
      );
    } catch (error) {
      this.logger.error('Error checking user interview request:', error);
      throw new BadRequestException('Lỗi khi kiểm tra lịch phỏng vấn của người dùng');
    }
  }

  async getFilteredBookings(
    dto: FilterMentorBookingDto,
    mentorId: string
  ): Promise<ResponseItem<PaginatedMentorBookingResponseDto>> {
    const where: Prisma.MentorWhereInput = {
      user: {
        id: mentorId,
      },
    };

    const { page = 1, take = 10 } = dto;
    const skip = (page - 1) * take;

    try {
      const mentor = await this.prisma.mentor.findUnique({
        where: { userId: mentorId },
        select: { id: true },
      });

      if (!mentor) {
        throw new NotFoundException('Không tìm thấy mentor');
      }

      const where = this.buildWhereClause({ ...dto, mentorId: mentor.id });

      const whereForStats: Prisma.MentorBookingWhereInput = {
        mentorId: mentor.id,
      };

      const [records, total, statsTotal, upcoming, completed, notJoined, levelList] = await this.prisma.$transaction([
        this.prisma.mentorBooking.findMany({
          where,
          include: {
            interviewRequest: {
              include: {
                currentSpot: true,
                exam: {
                  include: {
                    examLevel: true,
                    user: true,
                    examSet: { select: { name: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: Order.DESC },
          skip,
          take: take,
        }),

        this.prisma.mentorBooking.count({ where }),

        this.prisma.mentorBooking.count({ where: whereForStats }),
        this.prisma.mentorBooking.count({
          where: { ...whereForStats, status: MentorBookingStatus.UPCOMING },
        }),
        this.prisma.mentorBooking.count({
          where: { ...whereForStats, status: MentorBookingStatus.COMPLETED },
        }),
        this.prisma.mentorBooking.count({
          where: { ...whereForStats, status: MentorBookingStatus.NOT_JOINED },
        }),

        this.prisma.examLevel.findMany({
          select: { id: true, examLevel: true },
          orderBy: { examLevel: Order.ASC },
        }),
      ]);

      const stats = {
        total: statsTotal,
        upcoming,
        completed,
        notJoined,
      };

      const data: MentorBookingResponseV2[] = records.map((booking) => {
        const spot = booking.interviewRequest.currentSpot;

        return {
          id: booking.id,
          fullName: booking.interviewRequest.exam.user.fullName,
          email: booking.interviewRequest.exam.user.email,
          phoneNumber: booking.interviewRequest.exam.user.phoneNumber,
          interviewDate: spot?.startAt,
          timeSlot: spot ? `${spot.startAt.toISOString()} - ${spot.endAt.toISOString()}` : '',
          nameExamSet: booking.interviewRequest.exam?.examSet?.name,
          level: booking.interviewRequest.exam?.examLevel?.examLevel,
          status: booking.status,
        };
      });

      return new ResponseItem(
        {
          data: plainToInstance(MentorBookingResponseV2, data, {
            excludeExtraneousValues: true,
          }),
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
          stats,
          levels: levelList.map((lvl) => lvl.examLevel),
          statuses: Object.values(MentorBookingStatus),
        },
        'Lấy danh sách lịch phỏng vấn thành công'
      );
    } catch (error) {
      this.logger.error(`Lỗi khi lấy danh sách lịch phỏng vấn: ${error.message}`);
      throw new BadRequestException('Có lỗi xảy ra khi lấy danh sách lịch phỏng vấn');
    }
  }

  private buildWhereClause(filter: {
    mentorId: string;
    statuses?: MentorBookingStatus[];
    levels?: ExamLevelEnum[];
    dateStart?: Date | string;
    dateEnd?: Date | string;
    keyword?: string;
  }): Prisma.MentorBookingWhereInput {
    const { mentorId, statuses, levels, dateStart, dateEnd, keyword } = filter;

    const where: Prisma.MentorBookingWhereInput = {
      mentorId,
      ...(statuses?.length && { status: { in: statuses } }),
      interviewRequest: {
        ...(levels?.length && {
          exam: {
            examLevel: { examLevel: { in: levels } },
          },
        }),
        ...(dateStart || dateEnd
          ? {
              currentSpot: {
                startAt: {
                  ...(dateStart && { gte: new Date(dateStart) }),
                  ...(dateEnd && { lte: new Date(dateEnd) }),
                },
              },
            }
          : {}),
        ...(keyword && {
          exam: {
            user: {
              OR: [
                { fullName: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } },
                { phoneNumber: { contains: keyword, mode: 'insensitive' } },
              ],
            },
          },
        }),
      },
    };

    return where;
  }

  async assignMentorToRequests(
    dto: AssignMentorDto,
    userId: string,
    email: string
  ): Promise<ResponseItem<AssignMentorResultDto>> {
    const { interviewRequestIds } = dto;

    const mentor = await this.prisma.mentor.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, fullName: true } },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    const validRequests = await this.prisma.interviewRequest.findMany({
      where: {
        id: { in: interviewRequestIds },
      },
      select: { id: true },
    });

    const validRequestIds = validRequests.map((r) => r.id);
    const invalidRequestIds = interviewRequestIds.filter((id) => !validRequestIds.includes(id));
    if (invalidRequestIds.length > 0) {
      throw new BadRequestException(`interviewRequestIds không hợp lệ: ${invalidRequestIds.join(', ')}`);
    }

    const existingBookings = await this.prisma.mentorBooking.findMany({
      where: {
        mentorId: mentor.id,
        interviewRequestId: { in: validRequestIds },
      },
      select: { interviewRequestId: true },
    });

    const alreadyAssignedIds = new Set(existingBookings.map((b) => b.interviewRequestId));

    const toCreate = validRequestIds.filter((id) => !alreadyAssignedIds.has(id));

    if (toCreate.length === 0) {
      return {
        message: 'Không có đặt chỗ mới nào được tạo. Tất cả các yêu cầu đã được phân công.',
        data: { bookings: [] },
      };
    }

    const bookings = await this.prisma.$transaction(async (transaction) => {
      const createdBookings = await Promise.all(
        toCreate.map((requestId) =>
          transaction.mentorBooking.create({
            data: {
              mentorId: mentor.id,
              interviewRequestId: requestId,
            },
            select: {
              id: true,
              interviewRequestId: true,
              mentorId: true,
              status: true,
              createdAt: true,
            },
          })
        )
      );

      await transaction.interviewRequest.updateMany({
        where: { id: { in: toCreate } },
        data: { status: InterviewRequestStatus.ASSIGNED },
      });

      return createdBookings;
    });

    const assignedInterviews = await this.prisma.interviewRequest.findMany({
      where: {
        id: { in: toCreate },
        status: InterviewRequestStatus.ASSIGNED,
      },
      select: {
        id: true,
        currentSpot: {
          select: {
            startAt: true,
            endAt: true,
            timezone: true,
            meetUrl: true,
          },
        },
        exam: {
          select: {
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    await Promise.all(
      assignedInterviews.map(async (interview) => {
        const { exam, currentSpot } = interview;
        const user = exam?.user;
        if (user?.email && user?.fullName && currentSpot) {
          const meetLink = await GoogleCalendarService.createInterviewEvent(user.email, mentor.user.email, {
            startAt: currentSpot.startAt,
            endAt: currentSpot.endAt,
            timezone: currentSpot.timezone,
            meetUrl: currentSpot.meetUrl,
          });
          //TODO: Enable email service
          // await this.emailService.sendEmailInterviewScheduleToUser(
          //   user.email,
          //   user.fullName,
          //   mentor.user.fullName,
          //   currentSpot.startAt,
          //   currentSpot.endAt,
          //   meetLink
          // );
        }
      })
    );

    return new ResponseItem({ bookings }, 'Yêu cầu phỏng vấn đã được nhận');
  }

  async sendInterviewReminders(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);

    const end = new Date(tomorrow);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.mentorBooking.findMany({
      where: {
        status: MentorBookingStatus.UPCOMING,
        interviewRequest: {
          currentSpot: {
            startAt: {
              gte: start,
              lte: end,
            },
          },
        },
      },
      select: {
        id: true,
        mentor: {
          select: {
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        interviewRequest: {
          select: {
            currentSpot: {
              select: {
                startAt: true,
                endAt: true,
                meetUrl: true,
              },
            },
            exam: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const booking of bookings) {
      const reminderKey = `mentor_reminder_sent:${booking.id}`;
      try {
        const wasSet = await this.redisService.setIfNotExists(reminderKey, 'sent');
        if (!wasSet) {
          continue;
        }

        await this.emailService.sendMentorReminderEmail({
          mentorEmail: booking.mentor.user.email,
          mentorName: booking.mentor.user.fullName,
          intervieweeName: booking.interviewRequest.exam.user.fullName,
          interviewDate: booking.interviewRequest.currentSpot.startAt,
          timeSlot: null,
          meetLink: booking.interviewRequest.currentSpot.meetUrl,
        });
      } catch (error) {
        this.logger.error(`Failed to send reminder to ${booking.mentor.user.email}`, error.stack);
        await this.redisService.deleteValue(reminderKey);
      }
    }
  }

  async getBookingByMentor(dto: GetBookingByMentorRequestDto): Promise<ResponsePaginate<MentorBookingResponseDto>> {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: dto.mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    const where: Prisma.MentorBookingWhereInput = {
      mentorId: mentor.id,
      ...(dto.status && { status: { in: dto.status } }),
    };

    const [results, total] = await this.prisma.$transaction([
      this.prisma.mentorBooking.findMany({
        where,
        include: {
          interviewRequest: {
            include: {
              currentSpot: true,
              exam: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: Order.DESC },
        skip: dto.skip,
        take: dto.take,
      }),
      this.prisma.mentorBooking.count({ where }),
    ]);

    const data = results.map((booking) => {
      const spot = booking.interviewRequest.currentSpot;
      return {
        id: booking.id,
        fullName: booking.interviewRequest.exam.user.fullName,
        email: booking.interviewRequest.exam.user.email,
        interviewDate: spot?.startAt,
        timeSlot: spot ? `${spot.startAt.toISOString()} - ${spot.endAt.toISOString()}` : '',
        examId: booking.interviewRequest.exam.id,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });

    return new ResponsePaginate(
      data,
      new PageMetaDto({ itemCount: total, pageOptionsDto: dto }),
      'Lấy danh sách lịch phỏng vấn của mentor thành công'
    );
  }
}
