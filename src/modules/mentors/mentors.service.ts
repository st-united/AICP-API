import { BadRequestException, Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '@UsersModule/users.service';
import { EmailService } from '../email/email.service';
import { generateSecurePassword } from '@app/common/helpers/randomPassword';
import { ExamStatus, ExamLevelEnum, InterviewRequestStatus, MentorBookingStatus, Prisma } from '@prisma/client';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import { CreateMentorBookingDto } from './dto/request/create-mentor-booking.dto';
import { RedisService } from '../redis/redis.service';
import { TokenService } from '../auth/services/token.service';
import { FilterMentorBookingDto } from './dto/request/filter-mentor-booking.dto';
import { PaginatedMentorBookingResponseDto } from './dto/response/paginated-booking-response.dto';
import { plainToInstance } from 'class-transformer';
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
import { GetAvailableMentorsDto } from '@app/modules/mentors/dto/request/get-available-mentors.dto';
import { AvailableMentorResponseDto } from '@app/modules/mentors/dto/response/available-mentor-response.dto';
import { GoogleCalendarService } from '@app/common/helpers/google-calendar.service';

const VIETNAMESE_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
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

      return new ResponseItem(mentor, 'Tạo mentor thành công');
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

  async getAvailableMentors(dto: GetAvailableMentorsDto): Promise<ResponseItem<AvailableMentorResponseDto[]>> {
    const take = Number(dto.take ?? 10);
    const skip = Number(dto.skip ?? 0);
    const search = dto.search?.trim();
    const now = dayjs();

    const spotWhere: Prisma.MentorTimeSpotWhereInput = {
      status: MentorSpotStatus.AVAILABLE,
      startAt: {
        gte: now.toDate(),
      },
    };

    if (dto.scheduledDate) {
      const day = dayjs(dto.scheduledDate);
      if (!day.isValid()) {
        throw new BadRequestException('scheduledDate không hợp lệ');
      }

      if (day.isBefore(now, 'day')) {
        return new ResponseItem<AvailableMentorResponseDto[]>([], 'Lấy danh sách mentor khả dụng thành công');
      }

      if (dto.startTime && dto.endTime) {
        let startAt: dayjs.Dayjs;
        let endAt: dayjs.Dayjs;

        // Support ISO datetime with timezone (e.g., 2026-01-29T15:10:00+07:00)
        // and legacy HH:mm format for backward compatibility
        if (dto.startTime.includes('T')) {
          startAt = dayjs(dto.startTime);
          endAt = dayjs(dto.endTime);
        } else {
          // Legacy format: HH:mm - parse as UTC to match server timezone
          startAt = dayjs(`${dto.scheduledDate} ${dto.startTime}`, 'YYYY-MM-DD HH:mm');
          endAt = dayjs(`${dto.scheduledDate} ${dto.endTime}`, 'YYYY-MM-DD HH:mm');
        }

        if (!startAt.isValid() || !endAt.isValid() || !endAt.isAfter(startAt)) {
          throw new BadRequestException('Khung giờ không hợp lệ');
        }

        if (startAt.isBefore(now)) {
          return new ResponseItem<AvailableMentorResponseDto[]>([], 'Lấy danh sách mentor khả dụng thành công');
        }

        spotWhere.startAt = { gte: startAt.toDate() };
        spotWhere.endAt = { lte: endAt.toDate() };
      } else {
        const rangeStart = day.isSame(now, 'day') ? now : day.startOf('day');
        spotWhere.startAt = {
          gte: rangeStart.toDate(),
          lte: day.endOf('day').toDate(),
        };
      }
    }

    if (dto.durationMinutes) {
      const duration = Number(dto.durationMinutes);
      if (Number.isFinite(duration) && duration > 0) {
        spotWhere.durationMinutes = { gte: duration };
      }
    }

    const mentors = await this.prisma.mentor.findMany({
      where: {
        isActive: true,
        ...(search && {
          user: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
        timeSpots: {
          some: spotWhere,
        },
      },
      select: {
        id: true,
        userId: true,
        expertise: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: Order.DESC,
      },
      skip: Number.isFinite(skip) && skip > 0 ? skip : 0,
      take: Number.isFinite(take) && take > 0 ? take : 10,
    });

    const data: AvailableMentorResponseDto[] = mentors.map((mentor) => ({
      ...mentor,
      fullName: mentor.user?.fullName,
      email: mentor.user?.email,
      avatarUrl: mentor.user?.avatarUrl,
    }));

    return new ResponseItem<AvailableMentorResponseDto[]>(data, 'Lấy danh sách mentor khả dụng thành công');
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

      return new ResponseItem(mentor, 'Lấy thông tin mentor thành công');
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

        return new ResponseItem(updatedMentor, 'Cập nhật mentor thành công');
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
      const startAt = new Date(dto.startAt);
      const endAt = new Date(dto.endAt);
      const now = new Date();

      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
        throw new BadRequestException('Thời gian phỏng vấn không hợp lệ');
      }

      if (startAt <= now) {
        throw new BadRequestException('Không thể đặt lịch trong quá khứ');
      }

      const bookingResult = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.interviewRequest.findFirst({
          where: { examId: dto.examId },
        });

        if (existing) {
          throw new BadRequestException('Bài kiểm tra này đã được đặt lịch phỏng vấn.');
        }

        const exam = await tx.exam.findUnique({
          where: { id: dto.examId },
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        });

        if (!exam || exam.userId !== userId) {
          throw new BadRequestException('Bài thi không hợp lệ');
        }

        if (dto.mentorId) {
          const mentor = await tx.mentor.findFirst({
            where: { id: dto.mentorId, isActive: true },
            select: { id: true },
          });

          if (!mentor) {
            throw new BadRequestException('Mentor không hợp lệ');
          }
        }

        const spot = await tx.mentorTimeSpot.findFirst({
          where: {
            startAt,
            endAt,
            status: MentorSpotStatus.AVAILABLE,
            mentor: { isActive: true },
            ...(dto.mentorId ? { mentorId: dto.mentorId } : {}),
          },
          include: {
            mentor: {
              select: {
                id: true,
                user: { select: { fullName: true, email: true } },
              },
            },
          },
          orderBy: { startAt: 'asc' },
        });

        if (!spot) {
          throw new BadRequestException('Không còn khung giờ trống phù hợp');
        }

        const interviewRequest = await tx.interviewRequest.create({
          data: {
            examId: dto.examId,
            status: InterviewRequestStatus.PENDING,
          },
        });

        const updated = await tx.mentorTimeSpot.updateMany({
          where: { id: spot.id, status: MentorSpotStatus.AVAILABLE },
          data: { status: MentorSpotStatus.BOOKED },
        });

        if (!updated.count) {
          throw new ConflictException('Khung giờ đã được đặt');
        }

        await tx.interviewRequest.update({
          where: { id: interviewRequest.id },
          data: {
            currentSpotId: spot.id,
            status: InterviewRequestStatus.ASSIGNED,
          },
        });

        await tx.mentorBooking.create({
          data: {
            mentorId: spot.mentorId,
            interviewRequestId: interviewRequest.id,
            status: MentorBookingStatus.UPCOMING,
          },
        });

        await tx.exam.update({
          where: { id: dto.examId },
          data: {
            examStatus: ExamStatus.INTERVIEW_SCHEDULED,
          },
        });

        return {
          bookingData: {
            examId: dto.examId,
            interviewRequestId: interviewRequest.id,
            mentorId: spot.mentorId,
            mentorName: spot.mentor?.user?.fullName,
            spotId: spot.id,
            startAt: spot.startAt,
            endAt: spot.endAt,
            meetUrl: spot.meetUrl,
            status: InterviewRequestStatus.ASSIGNED,
          },
          emailContext: {
            userFullName: exam.user?.fullName,
            userEmail: exam.user?.email,
            mentorEmail: spot.mentor?.user?.email,
            calendarEventId: spot.calendarEventId,
            timezone: spot.timezone,
            meetUrl: spot.meetUrl,
            spotId: spot.id,
            startAt: spot.startAt,
            endAt: spot.endAt,
          },
        };
      });

      const { bookingData, emailContext } = bookingResult;
      let resolvedMeetUrl = bookingData.meetUrl;
      let calendarEventId = emailContext.calendarEventId;
      let createdCalendarEvent = false;

      if (!calendarEventId && emailContext.userEmail && emailContext.mentorEmail) {
        try {
          const eventInfo = await GoogleCalendarService.createInterviewEvent(
            emailContext.userEmail,
            emailContext.mentorEmail,
            {
              startAt: emailContext.startAt,
              endAt: emailContext.endAt,
              timezone: emailContext.timezone,
              meetUrl: emailContext.meetUrl ?? null,
            }
          );
          resolvedMeetUrl = eventInfo.meetUrl;
          calendarEventId = eventInfo.eventId;
          createdCalendarEvent = true;

          await this.prisma.mentorTimeSpot.update({
            where: { id: emailContext.spotId },
            data: {
              meetUrl: resolvedMeetUrl,
              calendarEventId: calendarEventId,
            },
          });
        } catch (error) {
          this.logger.error('Failed to create calendar event for booking', error);
        }
      }

      if (calendarEventId && emailContext.userEmail && !createdCalendarEvent) {
        try {
          await GoogleCalendarService.addAttendeesToEvent(calendarEventId, [
            emailContext.userEmail,
            emailContext.mentorEmail,
          ]);
        } catch (error) {
          this.logger.error('Failed to add attendee to calendar event', error);
        }
      }

      if (emailContext.userEmail && emailContext.userFullName) {
        try {
          const dateLabel = this.formatInterviewDateLabel(emailContext.startAt);
          const timeLabel = this.formatInterviewTimeLabel(emailContext.startAt, emailContext.endAt);
          await this.emailService.sendInterviewScheduleConfirmationEmail(
            emailContext.userFullName,
            emailContext.userEmail,
            dateLabel,
            timeLabel,
            resolvedMeetUrl
          );
        } catch (error) {
          this.logger.error('Failed to send interview confirmation email', error);
        }
      }

      return new ResponseItem(
        {
          ...bookingData,
          meetUrl: resolvedMeetUrl,
        },
        'Đặt lịch phỏng vấn thành công'
      );
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

  async assignMentorToRequests(dto: AssignMentorDto, userId: string): Promise<ResponseItem<AssignMentorResultDto>> {
    const { interviewRequestIds } = dto;

    const mentor = await this.prisma.mentor.findUnique({
      where: { userId },
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
        data: {
          bookings: [],
        },
      };
    }

    const transactionOps = [
      ...toCreate.map((requestId) =>
        this.prisma.mentorBooking.create({
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
      ),
      this.prisma.interviewRequest.updateMany({
        where: {
          id: { in: toCreate },
        },
        data: {
          status: InterviewRequestStatus.ASSIGNED,
        },
      }),
    ];

    const results = await this.prisma.$transaction(transactionOps);

    const bookings = results.slice(0, -1) as {
      id: string;
      interviewRequestId: string;
      mentorId: string;
      status: string;
      createdAt: Date;
    }[];

    return {
      message: 'Yêu cầu phỏng vấn đã được nhận',
      data: {
        bookings,
      },
    };
  }

  async checkUserInterviewRequest(examId: string): Promise<ResponseItem<CheckInterviewRequestResponseDto>> {
    const interviewRequest = await this.prisma.interviewRequest.findFirst({
      where: { examId },
      include: {
        currentSpot: {
          include: {
            mentor: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: Order.DESC },
    });

    return new ResponseItem(
      {
        hasInterviewRequest: !!interviewRequest,
        interviewRequest: interviewRequest
          ? {
              id: interviewRequest.id,
              examId: interviewRequest.examId,
              startAt: interviewRequest.currentSpot?.startAt,
              endAt: interviewRequest.currentSpot?.endAt,
              status: interviewRequest.status,
              mentorId: interviewRequest.currentSpot?.mentorId,
              mentorName: interviewRequest.currentSpot?.mentor?.user?.fullName,
              meetUrl: interviewRequest.currentSpot?.meetUrl,
            }
          : undefined,
      },
      interviewRequest ? 'Người dùng đã có lịch phỏng vấn' : 'Người dùng chưa có lịch phỏng vấn'
    );
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

  private formatInterviewDateLabel(date: Date): string {
    const day = dayjs(date);
    const weekday = VIETNAMESE_WEEKDAYS[day.day()] ?? '';
    return `${weekday}, ngày ${day.format('DD/MM/YYYY')}`;
  }

  private formatInterviewTimeLabel(startAt: Date, endAt: Date): string {
    return `${dayjs(startAt).format('HH:mm')} - ${dayjs(endAt).format('HH:mm')}`;
  }
}
