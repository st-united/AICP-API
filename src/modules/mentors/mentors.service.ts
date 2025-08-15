import { BadRequestException, Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { ResponseItem } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '@UsersModule/users.service';
import { EmailService } from '../email/email.service';
import { generateSecurePassword } from '@app/helpers/randomPassword';
import {
  ExamStatus,
  InterviewRequestStatus,
  MentorBookingStatus,
  Prisma,
  SFIALevel,
  TimeSlotBooking,
} from '@prisma/client';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import { CreateMentorBookingDto } from './dto/request/create-mentor-booking.dto';
import { RedisService } from '../redis/redis.service';
import { TokenService } from '../auth/services/token.service';
import { FilterMentorBookingDto } from './dto/request/filter-mentor-booking.dto';
import { PaginatedMentorBookingResponseDto } from './dto/response/paginated-booking-response.dto';
import { plainToInstance } from 'class-transformer';
import { MentorBookingResponseDto as MentorBookingResponseV1 } from './dto/response/mentor-booking.dto';
import { MentorBookingResponseDto as MentorBookingResponseV2 } from './dto/response/mentor-booking-response.dto';

import { google, Auth } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { CheckInterviewRequestResponseDto } from './dto/response/check-interview-request-response.dto';
import { AssignMentorDto } from './dto/response/assign-mentor.dto';
import { AssignMentorResultDto } from './dto/response/assign-mentor-result.dto';
import { timeSlotEnum, InterviewShift } from '@Constant/enums';

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

  async createScheduler(dto: CreateMentorBookingDto): Promise<ResponseItem<MentorBookingResponseV1>> {
    try {
      const existingBooking = await this.prisma.interviewRequest.findFirst({
        where: { examId: dto.examId },
      });

      if (existingBooking) {
        throw new BadRequestException('Bài kiểm tra này đã được đặt lịch phỏng vấn.');
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

  async createGoogleCalendarEvent(
    userEmail: string,
    mentorEmail: string,
    interviewDate: Date,
    timeSlot: keyof typeof timeSlotEnum
  ): Promise<string> {
    const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to obtain access token');
    }

    const calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client as Auth.OAuth2Client,
    });

    const formattedTimeSlot = timeSlotEnum[timeSlot];
    const [startHour, endHour] = formattedTimeSlot.split('-').map((h) => h.trim());
    const startDateTime = new Date(interviewDate);
    startDateTime.setHours(parseInt(startHour.split(':')[0]), 0, 0, 0);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(parseInt(endHour.split(':')[0]), 0, 0, 0);

    const event = {
      summary: 'Phỏng vấn chính thức',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      attendees: [{ email: userEmail }, { email: mentorEmail }],
      conferenceData: {
        createRequest: {
          requestId: `req-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'none',
        requestBody: event,
      });

      return response.data.hangoutLink || 'Link không khả dụng';
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error('Failed to create Google Calendar event');
    }
  }

  private buildWhereClause(filter: {
    mentorId: string;
    status?: MentorBookingStatus;
    level?: string;
    dateStart?: Date | string;
    dateEnd?: Date | string;
    keyword?: string;
  }): Prisma.MentorBookingWhereInput {
    const { mentorId, status, level, dateStart, dateEnd, keyword } = filter;

    const where: Prisma.MentorBookingWhereInput = {
      mentorId,
    };

    if (status) {
      where.status = status;
    }

    if (level || dateStart || dateEnd || keyword) {
      where.interviewRequest = {};

      if (level) {
        where.interviewRequest.exam = {
          sfiaLevel: {
            equals: level as SFIALevel,
          },
        };
      }

      if (dateStart || dateEnd) {
        where.interviewRequest.interviewDate = {};
        if (dateStart) {
          where.interviewRequest.interviewDate.gte = new Date(dateStart);
        }
        if (dateEnd) {
          where.interviewRequest.interviewDate.lte = new Date(dateEnd);
        }
      }

      if (keyword) {
        where.interviewRequest.exam.user = {
          OR: [
            { fullName: { contains: keyword, mode: 'insensitive' } },
            { email: { contains: keyword, mode: 'insensitive' } },
            { phoneNumber: { contains: keyword, mode: 'insensitive' } },
          ],
        };
      }
    }
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

    const assignedInterviews = await this.prisma.interviewRequest.findMany({
      where: {
        id: { in: toCreate },
        status: InterviewRequestStatus.ASSIGNED,
      },
      select: {
        id: true,
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
      bookings.map(async (booking) => {
        const interview = assignedInterviews.find((i) => i.id === booking.interviewRequestId);
        if (!interview) return;

        const { exam, interviewDate, timeSlot } = interview;
        const user = exam?.user;
        if (user?.email && user?.fullName && interviewDate && timeSlot) {
          const meetLink = await this.createGoogleCalendarEvent(user.email, email, interviewDate, timeSlot);

          await this.prisma.mentorBooking.update({
            where: { id: booking.id },
            data: { meetingUrl: meetLink },
          });

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

    return {
      message: 'Yêu cầu phỏng vấn đã được nhận',
      data: {
        bookings,
      },
    };
  }

  async getFilteredBookings(
    dto: FilterMentorBookingDto,
    mentorId: string
  ): Promise<ResponseItem<PaginatedMentorBookingResponseDto>> {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    const mentor = await this.prisma.mentor.findUnique({
      where: { userId: mentorId },
      select: { id: true },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found for this user');
    }
    const where = this.buildWhereClause({ ...dto, mentorId: mentor.id });

    const [records, total, upcoming, completed, notJoined] = await this.prisma.$transaction([
      this.prisma.mentorBooking.findMany({
        where,
        include: {
          interviewRequest: {
            include: {
              exam: {
                include: {
                  user: true,
                  examSet: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.mentorBooking.count({
        where,
      }),

      this.prisma.mentorBooking.count({
        where: {
          ...where,
          status: MentorBookingStatus.UPCOMING,
        },
      }),

      this.prisma.mentorBooking.count({
        where: {
          ...where,
          status: MentorBookingStatus.COMPLETED,
        },
      }),

      this.prisma.mentorBooking.count({
        where: {
          ...where,
          status: MentorBookingStatus.NOT_JOINED,
        },
      }),
    ]);

    const stats = {
      total,
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
      level: booking.interviewRequest.exam?.sfiaLevel,
      status: booking.status,
    }));

    return new ResponseItem(
      {
        data: plainToInstance(MentorBookingResponseV2, data, {
          excludeExtraneousValues: true,
        }),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats,
      },
      'Lấy danh sách lịch phỏng vấn thành công'
    );
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
}
