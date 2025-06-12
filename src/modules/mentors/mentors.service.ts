import { BadRequestException, Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '@UsersModule/users.service';
import { GetMentorsDto } from './dto/request/get-mentors.dto';
import { EmailService } from '../email/email.service';
import { generateSecurePassword } from '@app/helpers/randomPassword';
import { MentorBookingStatus, Prisma } from '@prisma/client';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';
import { MenteesByMentorIdDto } from './dto/response/mentees-response.dto';
import { GetMenteesDto } from './dto/request/get-mentees.dto';
import { GetAvailableMentorsDto } from './dto/request/get-available-mentors.dto';
import { SimpleResponse } from '@app/common/dtos/base-response-item.dto';
import { CreateMentorBookingDto } from './dto/request/create-mentor-booking.dto';
import { MentorBookingResponseDto } from './dto/response/mentor-booking.dto';

@Injectable()
export class MentorsService {
  private readonly logger = new Logger(MentorsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService
  ) {}

  async create(createMentorDto: CreateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    const password = generateSecurePassword();
    const { expertise, sfiaLevel, maxMentees, ...userData } = createMentorDto;
    const createUser = await this.userService.create({ ...userData, password });
    try {
      const mentor = await this.prisma.mentor.create({
        data: {
          userId: createUser.id,
          expertise: expertise,
          sfiaLevel: sfiaLevel,
          maxMentees: maxMentees ?? 5,
          isActive: false,
        },
      });

      const emailContent = {
        fullName: createUser.fullName,
        email: createUser.email,
        password,
      };

      this.emailService.sendEmailNewMentor(emailContent);

      return new ResponseItem(mentor, 'Tạo mentor thành công', MentorResponseDto);
    } catch (error) {
      throw new BadRequestException('Lỗi khi tạo mentor');
    }
  }

  async getMentors(params: GetMentorsDto): Promise<ResponsePaginate<MentorResponseDto>> {
    try {
      const where: Prisma.MentorWhereInput = {
        user: {
          fullName: {
            contains: params.search || '',
            mode: Prisma.QueryMode.insensitive,
          },
        },
      };

      if (params.isActive !== undefined) {
        where.isActive = params.isActive;
      }

      const [result, total] = await this.prisma.$transaction([
        this.prisma.mentor.findMany({
          where,
          orderBy: { [params.orderBy]: params.order },
          skip: params.skip,
          take: params.take,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                email: true,
                status: true,
              },
            },
            bookings: {
              where: {
                status: { in: [MentorBookingStatus.PENDING, MentorBookingStatus.ACCEPTED] },
                scheduledAt: { gt: new Date() },
              },
              select: { id: true },
            },
            _count: {
              select: {
                bookings: {
                  where: {
                    status: MentorBookingStatus.COMPLETED,
                  },
                },
              },
            },
          },
        }),
        this.prisma.mentor.count({ where }),
      ]);

      const mentorsWithStats = result.map(({ _count, bookings, ...rest }) => ({
        ...rest,
        completedCount: _count.bookings,
        upcomingCount: bookings.length,
      }));

      const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: params });

      return new ResponsePaginate(mentorsWithStats, pageMetaDto, 'Lấy danh sách mentor thành công');
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

  async getMenteesByMentorId(params: GetMenteesDto): Promise<ResponsePaginate<MenteesByMentorIdDto>> {
    try {
      const [bookings, total] = await this.prisma.$transaction([
        this.prisma.mentorBooking.findMany({
          where: {
            mentorId: params.mentorId,
            scheduledAt: {
              gt: new Date(),
            },
          },
          select: {
            scheduledAt: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.mentorBooking.count({
          where: {
            mentorId: params.mentorId,
            scheduledAt: {
              gt: new Date(),
            },
          },
        }),
      ]);

      const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: params });

      const mentees = bookings.map((booking) => ({
        ...booking.user,
        scheduledAt: booking.scheduledAt,
      }));

      return new ResponsePaginate(mentees, pageMetaDto, 'Lấy danh sách mentee thành công');
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy danh sách mentee');
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

  private async toggleMentorAccountStatus(id: string, activate: boolean): Promise<ResponseItem<null>> {
    const existingMentor = await this.prisma.mentor.findFirst({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingMentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    if (existingMentor.isActive === activate) {
      throw new ConflictException(`Mentor đã ${activate ? 'được kích hoạt' : 'bị vô hiệu hóa'}`);
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

  async deactivateMentorAccount(id: string): Promise<ResponseItem<null>> {
    return this.toggleMentorAccountStatus(id, false);
  }

  async activateMentorAccount(id: string): Promise<ResponseItem<null>> {
    return this.toggleMentorAccountStatus(id, true);
  }

  async getAvailableMentors(dto: GetAvailableMentorsDto) {
    try {
      const { search, scheduledDate, timeSlot, take, skip } = dto;

      const whereClause: Prisma.MentorWhereInput = {
        isActive: true,
        user: {
          deletedAt: { equals: null },
          ...(search
            ? {
                fullName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              }
            : {}),
        },
        ...(scheduledDate && timeSlot
          ? {
              bookings: {
                none: {
                  scheduledAt: new Date(scheduledDate),
                  timeSlot: timeSlot,
                },
              },
            }
          : {}),
      };

      const [mentors, total] = await this.prisma.$transaction([
        this.prisma.mentor.findMany({
          where: whereClause,
          include: {
            user: { select: { fullName: true, avatarUrl: true, id: true } },
          },
          take: parseInt(take),
          skip: parseInt(skip),
        }),
        this.prisma.mentor.count({ where: whereClause }),
      ]);

      return { data: mentors, total };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getGroupedBookedSlotsByMentor(mentorId: string) {
    try {
      const bookings = await this.prisma.mentorBooking.findMany({
        where: {
          mentorId,
          status: { in: ['PENDING', 'ACCEPTED', 'COMPLETED'] },
        },
        select: {
          scheduledAt: true,
          timeSlot: true,
        },
      });

      const grouped = bookings.reduce<Record<string, string[]>>((acc, { scheduledAt, timeSlot }) => {
        if (!timeSlot) return acc;
        const date = scheduledAt.toISOString().split('T')[0];
        acc[date] = acc[date] || [];
        acc[date].push(timeSlot);
        return acc;
      }, {});

      return new SimpleResponse(grouped, 'Lấy dữ liệu thành công');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async createScheduler(dto: CreateMentorBookingDto): Promise<SimpleResponse<MentorBookingResponseDto>> {
    try {
      const { mentorId, scheduledAt, timeSlot } = dto;

      // Get mentor details first
      const mentor = await this.prisma.mentor.findUnique({
        where: { id: mentorId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!mentor) {
        throw new NotFoundException('Không tìm thấy mentor');
      }

      // Check for existing booking conflict
      const existing = await this.prisma.mentorBooking.findFirst({
        where: {
          mentorId,
          scheduledAt: new Date(scheduledAt),
          timeSlot,
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
      });

      if (existing) {
        throw new ConflictException('Khung giờ này đã được đặt.');
      }

      const booking = await this.prisma.mentorBooking.create({
        data: {
          ...dto,
          scheduledAt: new Date(dto.scheduledAt),
        },
      });

      const generateBookingCode = (): string => {
        const date = new Date();
        const timestamp = date.getTime();
        return `AICP${timestamp}`;
      };

      const result = {
        ...booking,
        codeOrder: generateBookingCode(),
        mentor: {
          id: mentor.id,
          fullName: mentor.user.fullName,
          email: mentor.user.email,
          avatarUrl: mentor.user.avatarUrl,
          expertise: mentor.expertise,
        },
      };

      return new SimpleResponse(result, 'Đặt lịch thành công!');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
