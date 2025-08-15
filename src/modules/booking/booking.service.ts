import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FilterBookingResponseItemDto } from './dto/filter-booking-response-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';
import { ResponseItem } from '@app/common/dtos';
import { PaginatedBookingResponseDto } from './dto/paginated-booking-response.dto';
import { InterviewRequestStatus } from '@prisma/client';
import { DailyAvailabilityDto, ExamSlotsReportDto } from './dto/exam-slots-report.dto';
import { SlotStatus, TimeSlotBooking } from '@prisma/client';
import { UserInterviewInfoDto } from './dto/user-interview-info-response.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async findAllWithFilter(dto: FilterMentorBookingRequestDto): Promise<ResponseItem<PaginatedBookingResponseDto>> {
    const { name, levels, dateStart, dateEnd, page = '1', limit = '10' } = dto;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;
    const filters: any = {};

    if (dateStart || dateEnd || (levels && levels.length > 0)) {
      filters.interviewRequest = filters.interviewRequest || {};
      if (dateStart || dateEnd) {
        filters.interviewRequest = {
          interviewDate: {
            ...(dateStart && { gte: new Date(dateStart) }),
            ...(dateEnd && { lte: new Date(dateEnd) }),
          },
        };
      }

      if (levels && levels.length > 0) {
        filters.interviewRequest.exam = {
          examLevel: {
            examLevel: {
              in: levels,
            },
          },
        };
      }
    }

    const keywordFilter = name
      ? {
          OR: [
            { interviewRequest: { exam: { user: { fullName: { contains: name, mode: 'insensitive' } } } } },
            { interviewRequest: { exam: { user: { email: { contains: name, mode: 'insensitive' } } } } },
            { interviewRequest: { exam: { user: { phoneNumber: { contains: name, mode: 'insensitive' } } } } },
          ],
        }
      : {};

    const [records, total] = await this.prisma.$transaction([
      this.prisma.interviewRequest.findMany({
        where: {
          status: InterviewRequestStatus.PENDING,
          ...filters,
          ...keywordFilter,
        },
        include: {
          exam: {
            include: {
              examLevel: true,
              examSet: true,
              user: true,
            },
          },
        },
        orderBy: {
          interviewDate: 'desc',
        },
        skip,
        take,
      }),

      this.prisma.interviewRequest.count({
        where: {
          status: InterviewRequestStatus.PENDING,
          ...filters,
          ...keywordFilter,
        },
      }),
    ]);

    const data: FilterBookingResponseItemDto[] = records.map((booking) => ({
      id: booking?.id || '',
      timeSlost: booking?.timeSlot || '',
      name: booking?.exam.user?.fullName || '',
      email: booking?.exam.user?.email || '',
      phone: booking?.exam.user?.phoneNumber || '',
      nameExamSet: booking?.exam?.examSet?.name || '',
      examId: booking?.examId || '',
      level: booking?.exam?.examLevel.examLevel || '',
      date: booking?.interviewDate.toISOString() || '',
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

      let usedMorning = 0;
      let usedAfternoon = 0;

      for (const req of requests) {
        if (morningSlots.includes(req.timeSlot)) usedMorning++;
        else if (afternoonSlots.includes(req.timeSlot)) usedAfternoon++;
      }

      const morningRemaining = Math.max(0, morningTotal - usedMorning);
      const afternoonRemaining = Math.max(0, afternoonTotal - usedAfternoon);

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

  async getUserInformationForInterview(examId: string): Promise<ResponseItem<UserInterviewInfoDto>> {
    try {
      const exam = await this.prisma.exam.findUnique({
        where: { id: examId },
        select: {
          id: true,
          startedAt: true,
          sfiaLevel: true,
          timeSpentMinutes: true,
          examSetId: true,
          userId: true,
          examLevel: {
            select: { examLevel: true },
          },
          overallScore: true,
          examStatus: true,
          createdAt: true,
          examSet: {
            select: { id: true, name: true },
          },
          examPillarSnapshot: {
            select: {
              pillar: { select: { id: true, name: true } },
              score: true,
            },
          },
        },
      });

      if (!exam || !exam.examSetId) {
        throw new NotFoundException('Bài thi không tồn tại');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: exam.userId },
        include: {
          userPortfolio: true,
          job: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      const [examSet, examQuestions, userAnswers] = await Promise.all([
        this.prisma.examSet.findUnique({ where: { id: exam.examSetId } }),
        this.prisma.examSetQuestion.findMany({
          where: { examSetId: exam.examSetId },
          include: { question: { include: { answerOptions: true } } },
        }),
        this.prisma.userAnswer.findMany({
          where: { userId: exam.userId, examId },
          include: { selections: true },
        }),
      ]);

      if (!examSet) {
        throw new NotFoundException('Bộ đề thi không tồn tại');
      }

      const userAnswerMap: Record<string, string[]> = {};
      userAnswers.forEach((ua) => {
        userAnswerMap[ua.questionId] = ua.selections.map((s) => s.answerOptionId);
      });

      let correctCount = 0;
      examQuestions.forEach((q) => {
        const correctAnswers = q.question.answerOptions.filter((opt) => opt.isCorrect).map((opt) => opt.id);
        const userSelected = userAnswerMap[q.questionId] || [];

        if (userSelected.length === 0) return;

        const allCorrectSelected =
          userSelected.every((ans) => correctAnswers.includes(ans)) && correctAnswers.length === userSelected.length;

        if (allCorrectSelected) correctCount++;
      });

      const pillarScores = exam.examPillarSnapshot.reduce(
        (acc, snapshot) => {
          const name = snapshot.pillar.name.toUpperCase();
          acc[name.toLowerCase() as keyof typeof acc] = Number(snapshot.score);
          return acc;
        },
        { mindset: 0, skillset: 0, toolset: 0 }
      );

      let age: number | null = null;
      if (user.dob) {
        const dob = new Date(user.dob);
        const today = new Date();
        age = today.getFullYear() - dob.getFullYear();
        if (
          today.getMonth() < dob.getMonth() ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        ) {
          age--;
        }
      }

      const response: UserInterviewInfoDto = {
        personalInfo: {
          fullName: user.fullName,
          age,
          email: user.email,
          phoneNumber: user.phoneNumber,
          province: user.province,
          job: user.job.map((data) => data.name),
        },
        examResult: {
          sfiaLevel: exam.sfiaLevel,
          correctCount,
          totalQuestions: examQuestions.length,
          timeSpentMinutes: exam.timeSpentMinutes,
          examDate: exam.startedAt,
          overallScore: Number(exam.overallScore),
          scores: pillarScores,
        },
        portfolio: {
          linkedin: user.userPortfolio?.linkedInUrl ?? null,
          github: user.userPortfolio?.githubUrl ?? null,
          certificates: user.userPortfolio?.certificateFiles ?? null,
          experiences: user.userPortfolio?.experienceFiles ?? null,
        },
      };

      return new ResponseItem<UserInterviewInfoDto>(response, 'Lấy thông tin người đăng ký phỏng vấn thành công');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Đã xảy ra lỗi khi lấy thông tin người đăng ký phỏng vấn');
    }
  }
}
