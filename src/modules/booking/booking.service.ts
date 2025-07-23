// booking/booking.service.ts
import { Injectable } from '@nestjs/common';
import { FilterBookingDto } from './dto/filter-booking.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MentorBookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async getAll(filter: FilterBookingDto) {
    const { keyword, level, date, page = 1, limit = 10 } = filter;

    const where: any = {
      user: { deletedAt: null },
    };

    if (keyword) {
      where.OR = [
        { user: { fullName: { contains: keyword, mode: 'insensitive' } } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    if (level) {
      where.exam = { sfiaLevel: level };
    }

    if (date) {
      const from = new Date(date);
      const to = new Date(date);
      to.setHours(23, 59, 59, 999);
      where.scheduledAt = { gte: from, lte: to };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.mentorBooking.findMany({
        where,
        include: {
          user: true,
          exam: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.mentorBooking.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDetail(id: string) {
    return this.prisma.mentorBooking.findUnique({
      where: { id },
      include: {
        user: true,
        exam: true,
      },
    });
  }

  async addToMyList(userIds: string[], mentorId: string) {
    const result = await this.prisma.mentorBooking.updateMany({
      where: {
        userId: { in: userIds },
        mentorId,
      },
      data: {
        status: MentorBookingStatus.COMPLETED,
      },
    });

    return { count: result.count };
  }
}
