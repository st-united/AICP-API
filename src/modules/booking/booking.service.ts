import { Injectable } from '@nestjs/common';
import { FilterBookingResponseItemDto } from './dto/filter-booking-response-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';
import { ResponseItem } from '@app/common/dtos';
import { PaginatedBookingResponseDto } from './dto/paginated-booking-response.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async findAllWithFilter(dto: FilterMentorBookingRequestDto): Promise<ResponseItem<PaginatedBookingResponseDto>> {
    const { name, level, dateStart, dateEnd, page = '1', limit = '10' } = dto;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const filters: any = {};

    if (dateStart || dateEnd) {
      filters.interviewRequest = {
        interviewDate: {
          ...(dateStart && { gte: new Date(dateStart) }),
          ...(dateEnd && { lte: new Date(dateEnd) }),
        },
      };
    }

    if (level && level.length > 0) {
      filters.mentor = {
        sfiaLevel: {
          in: level,
        },
      };
    }

    const keywordFilter = name
      ? {
          OR: [
            { interviewRequest: { user: { fullName: { contains: name, mode: 'insensitive' } } } },
            { interviewRequest: { user: { email: { contains: name, mode: 'insensitive' } } } },
            { interviewRequest: { user: { phoneNumber: { contains: name, mode: 'insensitive' } } } },
          ],
        }
      : {};

    const [records, total] = await this.prisma.$transaction([
      this.prisma.mentorBooking.findMany({
        where: {
          ...filters,
          ...keywordFilter,
        },
        include: {
          mentor: true,
          interviewRequest: {
            include: {
              user: true,
              exam: {
                include: {
                  examSet: true,
                },
              },
            },
          },
        },
        orderBy: {
          interviewRequest: {
            interviewDate: 'desc',
          },
        },
        skip,
        take,
      }),
      this.prisma.mentorBooking.count({
        where: {
          ...filters,
          ...keywordFilter,
        },
      }),
    ]);

    const data: FilterBookingResponseItemDto[] = records.map((booking) => ({
      id: booking.interviewRequest?.id || '',
      timeSlost: booking.interviewRequest?.timeSlot || '',
      name: booking.interviewRequest?.user?.fullName || '',
      email: booking.interviewRequest?.user?.email || '',
      phone: booking.interviewRequest?.user?.phoneNumber || '',
      nameExamSet: booking.interviewRequest?.exam?.examSet?.name || '',
      level: booking.mentor?.sfiaLevel || '',
      date: booking.interviewRequest.interviewDate.toISOString() || '',
    }));

    return {
      data: {
        data,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      message: 'Lấy danh sách thành công',
    };
  }
}
