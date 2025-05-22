import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class MentorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService
  ) {}

  async create(createMentorDto: CreateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    try {
      const password = generateSecurePassword();
      const { expertise, ...userData } = createMentorDto;
      const createUser = await this.userService.create({ ...userData, password });
      const mentor = await this.prisma.mentor.create({
        data: {
          userId: createUser.id,
          expertise: createMentorDto.expertise,
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
      const where = {
        isActive: params.status || true,
        fullName: params.search || undefined,
      };

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
          orderBy: {
            [params.orderBy]: params.order,
          },
          skip: params.skip,
          take: params.take,
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
    try {
      return await this.prisma.$transaction(async (transactionClient) => {
        const existingMentor = await transactionClient.mentor.findFirst({
          where: { id },
        });

        if (!existingMentor) {
          throw new NotFoundException('Không tìm thấy mentor');
        }

        const userUpdateData: Omit<Prisma.UserUpdateInput, 'password'> = {
          fullName: updateMentorDto.fullName,
          phoneNumber: updateMentorDto.phoneNumber,
          avatarUrl: updateMentorDto.avatarUrl,
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

  async deactivateMentorAccount(id: string): Promise<ResponseItem<null>> {
    try {
      const existingMentor = await this.prisma.mentor.findFirst({
        where: { id },
      });
      if (!existingMentor) {
        throw new NotFoundException('Không tìm thấy mentor');
      }

      await this.prisma.mentor.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return new ResponseItem(null, 'Xóa mentor thành công');
    } catch (error) {
      throw new BadRequestException('Lỗi khi xóa mentor');
    }
  }
}
