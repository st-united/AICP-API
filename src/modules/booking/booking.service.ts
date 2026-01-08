import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FilterBookingResponseItemDto } from './dto/filter-booking-response-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';
import { ResponseItem } from '@app/common/dtos';
import { PaginatedBookingResponseDto } from './dto/paginated-booking-response.dto';
import { InterviewRequestStatus, SlotStatus } from '@prisma/client';
import { DailyAvailabilityDto, ExamSlotsReportDto } from './dto/exam-slots-report.dto';
import { UserInterviewInfoDto } from './dto/user-interview-info-response.dto';
import { MentorSpotStatus, Order } from '@Constant/enums';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async findAllWithFilter(dto: FilterMentorBookingRequestDto): Promise<ResponseItem<PaginatedBookingResponseDto>> {
    const { name, levels, dateStart, dateEnd, page = '1', limit = '10' } = dto;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      status: InterviewRequestStatus.PENDING,
    };

    if (dateStart || dateEnd) {
      where.currentSpot = {
        startAt: {
          ...(dateStart && { gte: new Date(dateStart) }),
          ...(dateEnd && { lte: new Date(dateEnd) }),
        },
      };
    }

    if (levels && levels.length > 0) {
      where.exam = {
        examLevel: {
          examLevel: { in: levels },
        },
      };
    }

    if (name) {
      where.exam = {
        ...where.exam,
        user: {
          OR: [
            { fullName: { contains: name, mode: 'insensitive' } },
            { email: { contains: name, mode: 'insensitive' } },
            { phoneNumber: { contains: name, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [records, total, levelList] = await this.prisma.$transaction([
      this.prisma.interviewRequest.findMany({
        where,
        include: {
          currentSpot: true,
          exam: {
            include: {
              examLevel: true,
              examSet: true,
              user: true,
            },
          },
        },
        orderBy: {
          currentSpot: {
            startAt: Order.DESC,
          },
        },
        skip,
        take,
      }),
      this.prisma.interviewRequest.count({ where }),
      this.prisma.examLevel.findMany({
        select: { id: true, examLevel: true },
        orderBy: { examLevel: Order.ASC },
      }),
    ]);

    const data: FilterBookingResponseItemDto[] = records.map((r) => ({
      id: r.id,
      timeSlots: r.currentSpot ? `${r.currentSpot.startAt.toISOString()} - ${r.currentSpot.endAt.toISOString()}` : '',
      name: r.exam.user.fullName,
      email: r.exam.user.email,
      phone: r.exam.user.phoneNumber,
      nameExamSet: r.exam.examSet?.name ?? '',
      examId: r.examId,
      level: r.exam.examLevel?.examLevel ?? '',
      date: r.currentSpot?.startAt?.toISOString() ?? '',
    }));

    return {
      data: {
        data,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
        levels: levelList.map((l) => l.examLevel),
      },
      message: 'Lấy danh sách thành công',
    };
  }

  async getAvailableSlotsByExamId(examId: string): Promise<ResponseItem<ExamSlotsReportDto>> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam?.finishedAt) {
      throw new BadRequestException('Không tìm thấy hoặc thiếu bài kiểm tra đã hoàn thành');
    }

    const days = [2, 3, 4].map((offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return date;
    });

    const totalMentors = await this.prisma.mentor.count();
    const dailyReports: DailyAvailabilityDto[] = [];

    for (const day of days) {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const spots = await this.prisma.mentorTimeSpot.findMany({
        where: {
          startAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const available = spots.filter((s) => s.status === MentorSpotStatus.AVAILABLE).length;
      const booked = spots.filter((s) => s.status === MentorSpotStatus.BOOKED).length;
      const total = spots.length || totalMentors * 8;

      dailyReports.push({
        date: startOfDay.toISOString().split('T')[0],
        morning: {
          slot: available,
          status: this.getSlotStatus(available, total),
        },
        afternoon: {
          slot: Math.max(0, total - booked),
          status: this.getSlotStatus(total - booked, total),
        },
      });
    }

    return {
      message: 'Danh sách slot khả dụng',
      data: { days: dailyReports },
    };
  }

  private getSlotStatus(remaining: number, total: number): SlotStatus {
    if (remaining <= 0) return SlotStatus.FULL;
    if (remaining <= total * 0.3) return SlotStatus.ALMOST_FULL;
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
          overallScore: true,
          examStatus: true,
          createdAt: true,
          examLevel: {
            select: { examLevel: true },
          },
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

      const interviewRequest = await this.prisma.interviewRequest.findUnique({
        where: { examId },
        include: {
          currentSpot: true,
        },
      });

      const [examQuestions, userAnswers] = await Promise.all([
        this.prisma.examSetQuestion.findMany({
          where: { examSetId: exam.examSetId },
          include: {
            question: {
              include: { answerOptions: true },
            },
          },
        }),
        this.prisma.userAnswer.findMany({
          where: { userId: exam.userId, examId },
          include: { selections: true },
        }),
      ]);

      const userAnswerMap: Record<string, string[]> = {};
      userAnswers.forEach((ua) => {
        userAnswerMap[ua.questionId] = ua.selections.map((s) => s.answerOptionId);
      });

      let correctCount = 0;
      examQuestions.forEach((q) => {
        const correctAnswers = q.question.answerOptions.filter((opt) => opt.isCorrect).map((opt) => opt.id);

        const userSelected = userAnswerMap[q.questionId] || [];
        if (userSelected.length === 0) return;

        const isCorrect =
          userSelected.every((ans) => correctAnswers.includes(ans)) && correctAnswers.length === userSelected.length;

        if (isCorrect) correctCount++;
      });

      const pillarScores = exam.examPillarSnapshot.reduce(
        (acc, snapshot) => {
          const key = snapshot.pillar.name.toLowerCase();
          acc[key as keyof typeof acc] = Number(snapshot.score);
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
          job: user.job.map((j) => j.name),
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
        interview: interviewRequest?.currentSpot
          ? {
              startAt: interviewRequest.currentSpot.startAt,
              endAt: interviewRequest.currentSpot.endAt,
              timezone: interviewRequest.currentSpot.timezone,
              status: interviewRequest.status,
            }
          : null,
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
