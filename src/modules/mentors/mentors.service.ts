import { UsersService } from '@UsersModule/users.service';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { generateSecurePassword } from '@app/helpers/randomPassword';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, Res } from '@nestjs/common';
import {
  ExamLevelEnum,
  ExamStatus,
  InterviewRequestStatus,
  MentorBookingStatus,
  Prisma,
  TimeSlotBooking,
  CompetencyDimension,
  AspectEvaluation,
  SuggestType,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { TokenService } from '../auth/services/token.service';
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
} from '@app/modules/mentors/dto/response/mentor-booking.dto';
import { MentorBookingResponseDto as MentorBookingResponseV2 } from '@app/modules/mentors/dto/response/mentor-booking-response.dto';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { PaginatedMentorBookingResponseDto } from './dto/response/paginated-booking-response.dto';

import { InterviewShift, Order } from '@Constant/enums';
import { GoogleCalendarService } from '@app/helpers/google-calendar.service';
import { AssignMentorResultDto } from './dto/response/assign-mentor-result.dto';
import { AssignMentorDto } from './dto/response/assign-mentor.dto';
import { CheckInterviewRequestResponseDto } from './dto/response/check-interview-request-response.dto';
import { GetExamResultDto } from './dto/response/get-exam-result.dto';
import { ExamServiceCommon } from '@app/common/services/exam.service';
import { AspectExvaluationDto } from './dto/response/aspect-exvaluation.dto';
import { calcElapsed, mapQuestionsWithAnswers } from '@app/common/utils/examUtils';
import { isNullOrEmpty } from '@app/common/utils/stringUtils';
import e from 'express';
import { SubmitAspectExvaluationRequestDto } from './dto/request/submit-aspect-evalution-request.dto';
import { SearchMentorRequestDto } from '@app/modules/mentors/dto/request/search-mentor-request.dto';
import { GetBookingByMentorRequestDto } from '@app/modules/mentors/dto/request/get-booking-by-mentor-request.dto';
@Injectable()
export class MentorsService {
  private readonly logger = new Logger(MentorsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
    private readonly examServiceCommon: ExamServiceCommon
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

  async createScheduler(userId, dto: CreateMentorBookingDto): Promise<ResponseItem<MentorBookingResponseV1>> {
    try {
      const existingBooking = await this.prisma.interviewRequest.findFirst({
        where: { examId: dto.examId },
      });

      if (existingBooking) {
        throw new BadRequestException('Bài kiểm tra này đã được đặt lịch phỏng vấn.');
      }

      const exams = await this.prisma.exam.findMany({
        where: {
          userId,
          examSet: {
            isActive: true,
            exam: {
              some: { id: dto.examId },
            },
          },
        },
      });

      const hasScheduled = exams.some((exam) => exam.examStatus === ExamStatus.INTERVIEW_SCHEDULED);

      if (hasScheduled) {
        throw new ConflictException('Bài thi đã được đặt lịch');
      }
      const interviewDate = new Date(dto.interviewDate);
      const startOfDay = new Date(interviewDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(interviewDate.setHours(23, 59, 59, 999));

      const mentors = await this.prisma.mentor.findMany({ where: { isActive: true } });
      const totalMentors = mentors.length;

      const morningSlots = [
        TimeSlotBooking.AM_08_09,
        TimeSlotBooking.AM_09_10,
        TimeSlotBooking.AM_10_11,
        TimeSlotBooking.AM_11_12,
      ];

      const afternoonSlots = [
        TimeSlotBooking.PM_02_03,
        TimeSlotBooking.PM_03_04,
        TimeSlotBooking.PM_04_05,
        TimeSlotBooking.PM_05_06,
      ];

      const selectedShiftSlots = dto.interviewShift === InterviewShift.MORNING ? morningSlots : afternoonSlots;

      let selectedSlot: TimeSlotBooking | null = null;

      for (const slot of selectedShiftSlots) {
        const count = await this.prisma.interviewRequest.count({
          where: {
            interviewDate: {
              gte: startOfDay,
              lt: endOfDay,
            },
            timeSlot: slot,
          },
        });

        if (count < totalMentors) {
          selectedSlot = slot;
          break;
        }
      }

      if (!selectedSlot) {
        throw new BadRequestException(`Tất cả khung giờ của buổi ${dto.interviewShift.toLowerCase()} đã đầy.`);
      }

      const booking = await this.prisma.interviewRequest.create({
        data: {
          examId: dto.examId,
          interviewDate: startOfDay,
          timeSlot: selectedSlot,
        },
      });

      await this.prisma.exam.update({
        where: { id: dto.examId },
        data: {
          examStatus: ExamStatus.INTERVIEW_SCHEDULED,
        },
      });

      return new ResponseItem(booking, 'Đặt lịch thành công!');
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(error);
      throw new BadRequestException(error?.message || 'Đặt lịch thất bại.');
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
        where: {
          examId,
        },
        select: {
          id: true,
          interviewDate: true,
          timeSlot: true,
          examId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const response: CheckInterviewRequestResponseDto = {
        hasInterviewRequest: !!interviewRequest,
        interviewRequest: interviewRequest
          ? {
              id: interviewRequest.id,
              interviewDate: interviewRequest.interviewDate,
              timeSlot: interviewRequest.timeSlot,
              examId: interviewRequest.examId,
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

      const data: MentorBookingResponseV2[] = records.map((booking) => ({
        id: booking.id,
        fullName: booking.interviewRequest.exam.user.fullName,
        email: booking.interviewRequest.exam.user.email,
        phoneNumber: booking.interviewRequest.exam.user.phoneNumber,
        timeSlot: booking.interviewRequest.timeSlot,
        interviewDate: booking.interviewRequest.interviewDate,
        nameExamSet: booking.interviewRequest.exam?.examSet?.name,
        level: booking.interviewRequest.exam?.examLevel?.examLevel,
        status: booking.status,
      }));

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
      ...(statuses && statuses.length > 0 && { status: { in: statuses } }),
      interviewRequest: {
        ...(levels &&
          levels.length > 0 && {
            exam: {
              examLevel: { examLevel: { in: levels as ExamLevelEnum[] } },
            },
          }),
        ...(dateStart || dateEnd
          ? {
              interviewDate: {
                ...(dateStart && { gte: new Date(dateStart) }),
                ...(dateEnd && { lte: new Date(dateEnd) }),
              },
            }
          : {}),
        ...(keyword && {
          OR: [
            {
              exam: {
                user: { fullName: { contains: keyword, mode: 'insensitive' } },
              },
            },
            {
              exam: {
                user: { email: { contains: keyword, mode: 'insensitive' } },
              },
            },
            {
              exam: {
                user: { phoneNumber: { contains: keyword, mode: 'insensitive' } },
              },
            },
          ],
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
        interviewDate: true,
        timeSlot: true,
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
        const { exam, interviewDate, timeSlot } = interview;
        const user = exam?.user;
        if (user?.email && user?.fullName && interviewDate && timeSlot) {
          const meetLink = await GoogleCalendarService.createInterviewEvent(
            user.email,
            mentor.user.email,
            interviewDate,
            timeSlot
          );

          await this.emailService.sendEmailInterviewScheduleToUser({
            email: user.email,
            fullName: user.fullName,
            interviewDate,
            timeSlot,
            meetLink,
          });
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
          interviewDate: {
            gte: start,
            lte: end,
          },
        },
      },
      select: {
        id: true,
        meetingUrl: true,
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
            interviewDate: true,
            timeSlot: true,
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
          interviewDate: booking.interviewRequest.interviewDate,
          timeSlot: booking.interviewRequest.timeSlot,
          meetLink: booking.meetingUrl,
        });
      } catch (error) {
        this.logger.error(`Failed to send reminder to ${booking.mentor.user.email}`, error.stack);
        await this.redisService.deleteValue(reminderKey);
      }
    }
  }
  async getExamResultByBooking(
    mentorBookingId: string,
    userCurrentId: string
  ): Promise<ResponseItem<GetExamResultDto>> {
    try {
      const mentor = await this.prisma.mentor.findUnique({
        where: { userId: userCurrentId },
        select: { id: true },
      });
      if (!mentor) {
        throw new NotFoundException('Không tìm thấy mentor');
      }
      const mentorBooking = await this.prisma.mentorBooking.findFirst({
        where: {
          id: mentorBookingId,
          mentorId: mentor.id,
        },
        select: {
          id: true,
          status: true,
          interviewRequest: {
            select: {
              examId: true,
            },
          },
        },
      });

      if (!mentorBooking) {
        throw new NotFoundException('Không tìm thấy lịch phỏng vấn');
      }

      const exam = await this.examServiceCommon.findExamById(mentorBooking.interviewRequest.examId);
      if (!exam) {
        throw new NotFoundException('Không tìm thấy bài thi');
      }

      const scores = await this.examServiceCommon.detectPillarScoresByAspect(
        exam.examPillarSnapshot,
        exam.examAspectSnapshot,
        false
      );

      const elapsedTime = calcElapsed(exam.createdAt, exam.updatedAt);
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;

      const [examQuestions, userAnswers] = await Promise.all([
        this.prisma.examSetQuestion.findMany({
          where: { examSetId: exam.examSet.id },
          include: { question: { include: { answerOptions: true } } },
        }),
        this.prisma.userAnswer.findMany({
          where: { examId: mentorBooking.interviewRequest.examId },
          include: { selections: true },
        }),
      ]);

      const mapped = mapQuestionsWithAnswers(examQuestions, userAnswers);
      correctCount = mapped.correctCount;
      wrongCount = mapped.wrongCount;
      skippedCount = mapped.skippedCount;

      const response: GetExamResultDto = {
        id: exam.id,
        examSet: exam.examSet,
        elapsedTime,
        correctCount,
        wrongCount,
        skippedCount,
        ...scores,
        level: exam.examLevel.examLevel,
        sfiaLevel: exam.sfiaLevel,
        overallScore: Number(exam.overallScore),
        userInfo: exam.user,
      };

      return new ResponseItem<GetExamResultDto>(response, 'Lấy kết quả bài thi');
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Lỗi khi lấy chi tiết bài thi');
    }
  }

  async validateAccessAspectEvaluation(mentorBookingId: string, mentorId: string) {
    const mentor = await this.prisma.mentor.findFirst({
      where: { userId: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    const mentorBooking = await this.prisma.mentorBooking.findFirst({
      where: {
        id: mentorBookingId,
        mentorId: mentor.id,
      },
    });

    if (!mentorBooking) {
      throw new NotFoundException('Không tìm thấy lịch phỏng vấn');
    }
  }

  async getPillarsWithAspects(): Promise<any> {
    const pillars = await this.prisma.competencyPillar.findMany({
      select: {
        id: true,
        name: true,
        weightWithinDimension: true,
        aspects: {
          select: {
            id: true,
            name: true,
            represent: true,
            weightWithinDimension: true,
            suggestions: {
              select: {
                id: true,
                name: true,
                type: true,
                priority: true,
              },
            },
          },
        },
      },
    });

    return pillars;
  }

  async mappingAspectEvaluationToDto(aspectEvaluation: any, pillars: any): Promise<AspectExvaluationDto> {
    const pillarsWithScores = pillars.map((pillar) => ({
      id: pillar.id,
      name: pillar.name,
      weightWithinDimension: Number(pillar.weightWithinDimension),
      aspects: pillar.aspects.map((aspect) => {
        const match = aspectEvaluation.details.find((d) => d.aspectId === aspect.id);
        if (!match) {
          throw new NotFoundException(`Không tìm thấy chi tiết đánh giá cho khía cạnh: ${aspect.name}`);
        }
        const miningSuggests = (aspect?.suggestions || [])
          .filter((suggest) => suggest.type === SuggestType.MINING_SUGGEST)
          .map((suggest) => ({
            id: suggest.id,
            name: suggest.name,
          }));
        const assessmentGuide = (aspect?.suggestions || [])
          .filter((suggest) => suggest.type === SuggestType.ASSESSMENT_GUIDED)
          .sort((a, b) => a.sequence - b.sequence)
          .map((suggest) => ({
            id: suggest.id,
            name: suggest.name,
          }));
        return {
          id: aspect.id,
          name: aspect.name,
          represent: aspect.represent,
          weightWithinDimension: Number(aspect.weightWithinDimension),
          score: match ? Number(match.score) : 0,
          note: isNullOrEmpty(match.note) ? null : JSON.parse(match.note),
          miningSuggest: miningSuggests,
          assessmentGuide: assessmentGuide,
        };
      }),
    }));

    const mindset = pillarsWithScores.find((p) => p.name.toUpperCase() === 'MINDSET') || null;
    const skillset = pillarsWithScores.find((p) => p.name.toUpperCase() === 'SKILLSET') || null;
    const toolset = pillarsWithScores.find((p) => p.name.toUpperCase() === 'TOOLSET') || null;

    const response: AspectExvaluationDto = {
      id: aspectEvaluation.id,
      progress: Number(aspectEvaluation.progress),
      isDraft: aspectEvaluation.isDraft,
      mindset: mindset,
      skillset: skillset,
      toolset: toolset,
    };

    return response;
  }

  async generateAspectEvaluation(
    mentorBookingId: string,
    mentorId: string
  ): Promise<ResponseItem<AspectExvaluationDto>> {
    try {
      await this.validateAccessAspectEvaluation(mentorBookingId, mentorId);

      let aspectEvaluationIfExist = await this.prisma.aspectEvaluation.findUnique({
        where: { mentorBookingId },
        select: {
          id: true,
          progress: true,
          isDraft: true,
          details: true,
        },
      });

      const pillars = await this.getPillarsWithAspects();

      const allAspects = pillars.flatMap((p) => p.aspects);
      if (!aspectEvaluationIfExist) {
        aspectEvaluationIfExist = await this.prisma.aspectEvaluation.create({
          data: {
            assessor: { connect: { id: mentorId } },
            mentorBooking: { connect: { id: mentorBookingId } },
            progress: new Prisma.Decimal(0),
            isDraft: true,
            details: {
              createMany: {
                data: allAspects.map((aspect) => ({
                  aspectId: aspect.id,
                  score: new Prisma.Decimal(0),
                })),
              },
            },
          },
          select: {
            id: true,
            progress: true,
            isDraft: true,
            details: true,
          },
        });
      }

      const response = await this.mappingAspectEvaluationToDto(aspectEvaluationIfExist, pillars);
      return new ResponseItem(response, 'Tạo bài đánh giá thành công');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Lỗi khi tạo bài đánh giá');
    }
  }

  async getAspectEvaluation(evaluationId: string, userCurrentId: string): Promise<ResponseItem<AspectExvaluationDto>> {
    try {
      const aspectEvaluation = await this.prisma.aspectEvaluation.findUnique({
        where: { id: evaluationId },
        select: {
          id: true,
          mentorBookingId: true,
          progress: true,
          isDraft: true,
          details: true,
        },
      });
      if (!aspectEvaluation) {
        throw new NotFoundException('Không tìm thấy bài đánh giá');
      }
      await this.validateAccessAspectEvaluation(aspectEvaluation.mentorBookingId, userCurrentId);

      const pillars = await this.getPillarsWithAspects();

      const response = await this.mappingAspectEvaluationToDto(aspectEvaluation, pillars);

      return new ResponseItem(response, 'Lấy dữ liệu đánh giá thành công');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Lỗi khi lấy kết quả đánh giá');
    }
  }

  async getBookingByMentor(dto: GetBookingByMentorRequestDto): Promise<ResponsePaginate<MentorBookingResponseDto>> {
    try {
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
          select: {
            id: true,
            interviewRequest: {
              select: {
                exam: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        fullName: true,
                        email: true,
                      },
                    },
                  },
                },
                interviewDate: true,
                timeSlot: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: Order.DESC },
          skip: dto.skip,
          take: dto.take,
        }),

        this.prisma.mentorBooking.count({ where }),
      ]);

      const interviewRequests: MentorBookingResponseDto[] = results.map((booking) => ({
        id: booking.id,
        fullName: booking.interviewRequest.exam.user.fullName,
        email: booking.interviewRequest.exam.user.email,
        interviewDate: booking.interviewRequest.interviewDate,
        timeSlot: booking.interviewRequest.timeSlot,
        examId: booking.interviewRequest.exam.id,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      }));

      return new ResponsePaginate<MentorBookingResponseDto>(
        interviewRequests,
        new PageMetaDto({ itemCount: total, pageOptionsDto: dto }),
        'Lấy danh sách lịch phỏng vấn sắp tới của cố vấn thành công'
      );
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy danh sách lịch phỏng vấn sắp tới của cố vấn');
    }
  }
}
