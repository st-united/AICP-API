import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterBookingResponseItemDto } from './dto/filter-booking-response-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';
import { ResponseItem } from '@app/common/dtos';
import { PaginatedBookingResponseDto } from './dto/paginated-booking-response.dto';
import { DailyAvailabilityDto, ExamSlotsReportDto } from './dto/exam-slots-report.dto';
import { SlotStatus, TimeSlotBooking } from '@prisma/client';
import { log } from 'console';

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
      const levels = level.split(',').map((l) => l.trim());
      filters.mentor = {
        sfiaLevel: {
          in: levels,
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
              exam: {
                include: {
                  examSet: true,
                  user: true,
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
      name: booking.interviewRequest?.exam.user?.fullName || '',
      email: booking.interviewRequest?.exam.user?.email || '',
      phone: booking.interviewRequest?.exam.user?.phoneNumber || '',
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

  async getAvailableSlotsByExamId(examId: string): Promise<ResponseItem<ExamSlotsReportDto>> {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });

    if (!exam?.finishedAt) {
      throw new BadRequestException('Không tìm thấy hoặc thiếu bài kiểm tra đã hoàn thành');
    }

    const days = [2, 3, 4].map((offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return date.toISOString().split('T')[0];
    });

    const morningSlots: TimeSlotBooking[] = [
      TimeSlotBooking.AM_08_09,
      TimeSlotBooking.AM_09_10,
      TimeSlotBooking.AM_10_11,
      TimeSlotBooking.AM_11_12,
    ];
    const afternoonSlots: TimeSlotBooking[] = [
      TimeSlotBooking.PM_02_03,
      TimeSlotBooking.PM_03_04,
      TimeSlotBooking.PM_04_05,
      TimeSlotBooking.PM_05_06,
    ];

    const totalMentors = await this.prisma.mentor.count();
    const dailyReports: DailyAvailabilityDto[] = [];

    for (const day of days) {
      const morningTotal = totalMentors * morningSlots.length;
      const afternoonTotal = totalMentors * afternoonSlots.length;

      const startOfDay = new Date(`${day}T00:00:00.000Z`);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      const requests = await this.prisma.interviewRequest.findMany({
        where: {
          interviewDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        select: {
          timeSlot: true,
          interviewDate: true,
        },
      });
      console.log(requests);

      let usedMorning = 0;
      let usedAfternoon = 0;

      for (const req of requests) {
        if (morningSlots.includes(req.timeSlot)) usedMorning++;
        else if (afternoonSlots.includes(req.timeSlot)) usedAfternoon++;
      }
      console.log(usedMorning);
      console.log(usedAfternoon);

      const morningRemaining = Math.max(0, morningTotal - usedMorning);
      const afternoonRemaining = Math.max(0, afternoonTotal - usedAfternoon);
      console.log(morningTotal);
      console.log(afternoonTotal);

      console.log(morningRemaining);
      console.log(afternoonRemaining);

      dailyReports.push({
        date: day,
        morning: {
          slot: morningRemaining,
          status: this.getSlotStatus(morningRemaining, totalMentors),
        },
        afternoon: {
          slot: afternoonRemaining,
          status: this.getSlotStatus(morningRemaining, totalMentors),
        },
      });
    }
    console.log(dailyReports);

    return {
      message: 'Danh sách slot khả dụng',
      data: { days: dailyReports },
    };
  }

  private getSlotStatus(remaining: number, total: number): SlotStatus {
    if (remaining === 0) return SlotStatus.FULL;
    if (remaining <= total / 1) return SlotStatus.ALMOST_FULL;
    return SlotStatus.AVAILABLE;
  }
}
