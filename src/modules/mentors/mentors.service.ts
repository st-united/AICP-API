import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorDto } from './dto/request/create-mentor.dto';
import { UpdateMentorDto } from './dto/request/update-mentor.dto';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { MentorResponseDto } from './dto/response/mentor-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '@UsersModule/users.service';
import { GetMentorsDto } from './dto/request/get-mentors.dto';
import { EmailService } from '../email/email.service';
import { generateSecurePassword } from '@app/helpers/randomPassword';
import { MentorBookingStatus } from '@prisma/client';
import { MentorStatsDto } from './dto/response/getMentorStats.dto';

@Injectable()
export class MentorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService
  ) {}

  async create(createMentorDto: CreateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    const password = generateSecurePassword();
    const { expertise, ...userData } = createMentorDto;
    const createUser = await this.userService.create({ ...userData, password });
    const mentor = await this.prisma.mentor.create({
      data: {
        userId: createUser.id,
        expertise: createMentorDto.expertise,
      },
    });

    this.emailService.sendIEmailNewMentor(createUser.fullName, createUser.email, password);

    return new ResponseItem(mentor, 'Tạo mentor thành công', MentorResponseDto);
  }

  async getMentors(params: GetMentorsDto): Promise<ResponsePaginate<MentorResponseDto>> {
    const where = {
      isActive: params.status ? params.status : true,
      fullName: params.search ? params.search : undefined,
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
              email: true,
              phoneNumber: true,
              status: true,
            },
          },
          bookings: {
            where: {
              scheduledAt: {
                gt: new Date(),
              },
            },
            select: {
              user: {
                select: {
                  email: true,
                  fullName: true,
                },
              },
              scheduledAt: true,
            },
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

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: params });

    return new ResponsePaginate(result, pageMetaDto, 'Lấy danh sách mentor thành công');
  }

  async getMentor(id: string): Promise<ResponseItem<MentorResponseDto>> {
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
  }

  async getMentorStats(): Promise<ResponseItem<MentorStatsDto>> {
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
  }

  async updateMentor(id: string, updateMentorDto: UpdateMentorDto): Promise<ResponseItem<MentorResponseDto>> {
    const { expertise, isActive, ...userData } = updateMentorDto;

    const existingMentor = await this.prisma.mentor.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingMentor) {
      throw new NotFoundException('Không tìm thấy mentor');
    }

    await this.userService.updateProfile(existingMentor.userId, userData);

    const updatedMentor = await this.prisma.mentor.update({
      where: { id },
      data: {
        expertise,
        isActive,
      },
      include: {
        user: true,
      },
    });

    return new ResponseItem(updatedMentor, 'Cập nhật mentor thành công', MentorResponseDto);
  }

  async softRemoveMentor(id: string): Promise<ResponseItem<null>> {
    const existingMentor = await this.getMentor(id);

    if (existingMentor) {
      await this.prisma.mentor.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
    }

    return new ResponseItem(null, 'Xóa mentor thành công');
  }
}
