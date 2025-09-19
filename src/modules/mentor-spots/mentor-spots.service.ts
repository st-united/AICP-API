import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExamStatus, MentorSpotStatus, Prisma } from '@prisma/client';
import { GetMentorSpotsQueryDto } from './dto/request/get-mentor-spots.dto';
import { GetAllMentorSpotsQueryDto } from './dto/request/get-all-mentor-spots.dto';
import { format as formatDate, parse as parseDate, isValid as isValidDate, addDays } from 'date-fns';
import {
  ensureValidTz,
  formatUtcToLocalParts,
  localMinutesToUtc,
  parseHHMM,
  splitToSlots,
  validateWindowsNonOverlapping,
} from './common/utils/datetime-tz.util';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { SaveMentorSpotsDto } from './dto/request/save-mentor-spots.dto';

import { ResponseItem } from '@app/common/dtos';
import { SaveSpotsResponseDto, GetMentorSpotsResponseDto } from './dto/response/spot-item.dto';
import { GetAllMentorSpotsResponseDto } from './dto/response/get-all-mentor-spots.dto';
import { Order } from '@Constant/enums';
import { BookSpotResponseDto } from './dto/response/book-spot-response.dto';
import { BookSpotDto } from './dto/request/book-spot.dto';

@Injectable()
export class MentorSpotsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveSpots(mentorId: string, payload: SaveMentorSpotsDto): Promise<ResponseItem<SaveSpotsResponseDto>> {
    const { timezone, duration, days, replaceExisting = true } = payload;

    ensureValidTz(timezone);
    if (!Array.isArray(days) || days.length === 0) {
      throw new BadRequestException('days is required');
    }

    for (const d of days) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
        throw new BadRequestException(`Invalid date: ${d.date}`);
      }
      validateWindowsNonOverlapping(d.date, d.windows);
    }

    const firstDay = days.reduce((min, curr) => (curr.date < min ? curr.date : min), days[0].date);
    const lastDay = days.reduce((max, curr) => (curr.date > max ? curr.date : max), days[0].date);

    const startOfFirstLocal = parseDate(`${firstDay} 00:00`, 'yyyy-MM-dd HH:mm', new Date());
    const endOfLastLocal = parseDate(`${lastDay} 23:59`, 'yyyy-MM-dd HH:mm', new Date());
    if (!isValidDate(startOfFirstLocal) || !isValidDate(endOfLastLocal)) {
      throw new BadRequestException('Invalid date range');
    }

    const rangeStartUtc = fromZonedTime(startOfFirstLocal, timezone);
    const rangeEndUtc = new Date(fromZonedTime(endOfLastLocal, timezone).getTime() + 59_000 + 999);

    if (replaceExisting) {
      await this.prisma.mentorTimeSpot.deleteMany({
        where: {
          mentorId,
          status: MentorSpotStatus.AVAILABLE,
          startAt: { gte: rangeStartUtc, lte: rangeEndUtc },
        },
      });
    }

    // Generate slots
    const toCreate: Prisma.MentorTimeSpotCreateManyInput[] = [];

    for (const d of days) {
      for (const w of d.windows) {
        const s = parseHHMM(w.start);
        const e = parseHHMM(w.end);

        for (const seg of splitToSlots(s, e, duration)) {
          const { startAt, endAt } = localMinutesToUtc(d.date, seg.start, seg.end, timezone);
          toCreate.push({
            mentorId,
            startAt,
            endAt,
            durationMinutes: duration,
            status: MentorSpotStatus.AVAILABLE,
            timezone,
          });
        }
      }
    }

    if (toCreate.length === 0) {
      throw new BadRequestException('No spots to create with given inputs');
    }

    // Batch create để an toàn với lượng lớn
    const BATCH = 5000;
    for (let i = 0; i < toCreate.length; i += BATCH) {
      await this.prisma.mentorTimeSpot.createMany({
        data: toCreate.slice(i, i + BATCH),
        skipDuplicates: true,
      });
    }

    // Lấy lại & format local để FE render
    const created = await this.prisma.mentorTimeSpot.findMany({
      where: {
        mentorId,
        status: MentorSpotStatus.AVAILABLE,
        startAt: { gte: rangeStartUtc, lte: rangeEndUtc },
      },
      orderBy: { startAt: Order.ASC },
      select: { id: true, startAt: true, endAt: true },
    });

    const byDate: Record<
      string,
      { id: string; startLabel: string; endLabel: string; startAt: string; endAt: string }[]
    > = {};

    for (const r of created) {
      const { date: sDate, time: sTime } = formatUtcToLocalParts(r.startAt, timezone);
      const { time: eTime } = formatUtcToLocalParts(r.endAt, timezone);
      (byDate[sDate] ??= []).push({
        id: r.id,
        startLabel: sTime,
        endLabel: eTime,
        startAt: r.startAt.toISOString(),
        endAt: r.endAt.toISOString(),
      });
    }

    return new ResponseItem<SaveSpotsResponseDto>(
      {
        timezone,
        days: Object.entries(byDate).map(([date, slots]) => ({ date, slots })),
      },
      'Lưu slots thành công',
      SaveSpotsResponseDto
    );
  }

  async getAvailableSpots(
    mentorId: string,
    query: GetMentorSpotsQueryDto
  ): Promise<ResponseItem<GetMentorSpotsResponseDto>> {
    const { timezone, from, to } = query;
    let { page = 1, pageSize = 500 } = query;

    ensureValidTz(timezone);

    // chuẩn hoá pagination
    page = Math.max(1, Number(page) || 1);
    pageSize = Math.max(1, Math.min(2000, Number(pageSize) || 500));

    const now = new Date();
    const nowInTz = toZonedTime(now, timezone);
    const defaultFrom = formatDate(nowInTz, 'yyyy-MM-dd');
    const defaultTo = formatDate(addDays(nowInTz, 14), 'yyyy-MM-dd');

    const fromStr = from || defaultFrom;
    const toStr = to || from || defaultTo;

    const startLocal = parseDate(`${fromStr} 00:00`, 'yyyy-MM-dd HH:mm', new Date());
    const endLocal = parseDate(`${toStr} 23:59`, 'yyyy-MM-dd HH:mm', new Date());
    if (!isValidDate(startLocal) || !isValidDate(endLocal)) {
      throw new BadRequestException('Invalid date range');
    }

    const rangeStartUtc = fromZonedTime(startLocal, timezone);
    const rangeEndUtc = new Date(fromZonedTime(endLocal, timezone).getTime() + 59_000 + 999);

    const where: Prisma.MentorTimeSpotWhereInput = {
      mentorId,
      status: MentorSpotStatus.AVAILABLE,
      startAt: { gte: rangeStartUtc, lte: rangeEndUtc },
    };

    const total = await this.prisma.mentorTimeSpot.count({ where });

    const skip = (page - 1) * pageSize;
    const spots = await this.prisma.mentorTimeSpot.findMany({
      where,
      orderBy: { startAt: Order.ASC },
      skip,
      take: pageSize,
      select: { id: true, startAt: true, endAt: true },
    });

    const byDate: Record<
      string,
      { id: string; startLabel: string; endLabel: string; startAt: string; endAt: string }[]
    > = {};

    for (const s of spots) {
      const sParts = formatUtcToLocalParts(s.startAt, timezone);
      const eParts = formatUtcToLocalParts(s.endAt, timezone);
      (byDate[sParts.date] ??= []).push({
        id: s.id,
        startLabel: sParts.time,
        endLabel: eParts.time,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
      });
    }

    return new ResponseItem<GetMentorSpotsResponseDto>(
      {
        timezone,
        range: { from: fromStr, to: toStr },
        days: Object.entries(byDate).map(([date, slots]) => ({ date, slots })),
        pagination: { page, pageSize, total },
      },
      'Lấy slots thành công',
      GetMentorSpotsResponseDto
    );
  }

  async getAllAvailableSpots(query: GetAllMentorSpotsQueryDto): Promise<ResponseItem<GetAllMentorSpotsResponseDto>> {
    const { timezone, from, to } = query;
    let { page = 1, pageSize = 10 } = query;

    ensureValidTz(timezone);

    // chuẩn hoá pagination
    page = Math.max(1, Number(page) || 1);
    pageSize = Math.max(1, Math.min(200, Number(pageSize) || 10));

    const now = new Date();
    const nowInTz = toZonedTime(now, timezone);
    const defaultFrom = formatDate(nowInTz, 'yyyy-MM-dd');
    const defaultTo = formatDate(addDays(nowInTz, 14), 'yyyy-MM-dd');

    const fromStr = from || defaultFrom;
    const toStr = to || defaultTo;

    const startLocal = parseDate(`${fromStr} 00:00`, 'yyyy-MM-dd HH:mm', new Date());
    const endLocal = parseDate(`${toStr} 23:59`, 'yyyy-MM-dd HH:mm', new Date());
    if (!isValidDate(startLocal) || !isValidDate(endLocal)) {
      throw new BadRequestException('Invalid date range');
    }

    const rangeStartUtc = fromZonedTime(startLocal, timezone);
    const rangeEndUtc = new Date(fromZonedTime(endLocal, timezone).getTime() + 59_000 + 999);

    // distinct mentor list for pagination
    const distinctMentorIds = await this.prisma.mentorTimeSpot.findMany({
      where: {
        status: MentorSpotStatus.AVAILABLE,
        startAt: { gte: rangeStartUtc, lte: rangeEndUtc },
      },
      distinct: ['mentorId'],
      select: { mentorId: true },
      orderBy: { mentorId: Order.ASC },
    });

    const totalMentors = distinctMentorIds.length;
    if (totalMentors === 0) {
      return new ResponseItem<GetAllMentorSpotsResponseDto>(
        {
          timezone,
          range: { from: fromStr, to: toStr },
          mentors: [],
          pagination: { page, pageSize, totalMentors },
        },
        'Không có mentor nào có slot',
        GetAllMentorSpotsResponseDto
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageMentorIds = distinctMentorIds.slice(start, end).map((x) => x.mentorId);

    const spots = await this.prisma.mentorTimeSpot.findMany({
      where: {
        mentorId: { in: pageMentorIds },
        status: MentorSpotStatus.AVAILABLE,
        startAt: { gte: rangeStartUtc, lte: rangeEndUtc },
      },
      orderBy: [{ mentorId: Order.ASC }, { startAt: Order.ASC }],
      select: {
        id: true,
        mentorId: true,
        startAt: true,
        endAt: true,
        mentor: {
          select: {
            id: true,
            expertise: true,
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    const byMentor: Record<string, { mentor: any; days: { date: string; slots: any[] }[] }> = {};

    for (const s of spots) {
      const { date, time: sTime } = formatUtcToLocalParts(s.startAt, timezone);
      const { time: eTime } = formatUtcToLocalParts(s.endAt, timezone);

      if (!byMentor[s.mentorId]) {
        byMentor[s.mentorId] = {
          mentor: {
            id: s.mentor.id,
            expertise: s.mentor.expertise,
            user: s.mentor.user,
          },
          days: [],
        };
      }

      let dayGroup = byMentor[s.mentorId].days.find((d) => d.date === date);
      if (!dayGroup) {
        dayGroup = { date, slots: [] };
        byMentor[s.mentorId].days.push(dayGroup);
      }

      dayGroup.slots.push({
        id: s.id,
        startLabel: sTime,
        endLabel: eTime,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
      });
    }

    return new ResponseItem<GetAllMentorSpotsResponseDto>(
      {
        timezone,
        range: { from: fromStr, to: toStr },
        mentors: Object.values(byMentor),
        pagination: { page, pageSize, totalMentors },
      },
      'Lấy slots theo mentor thành công',
      GetAllMentorSpotsResponseDto
    );
  }

  async bookSpot(spotId: string, dto: BookSpotDto): Promise<ResponseItem<BookSpotResponseDto>> {
    const { userId, examId, note, timezone = 'Asia/Ho_Chi_Minh' } = dto;
    console.log(dto, 'dto');

    return await this.prisma.$transaction(async (tx) => {
      // 1) Spot phải AVAILABLE và chưa quá giờ
      const spot = await tx.mentorTimeSpot.findUnique({
        where: { id: spotId },
        select: { id: true, mentorId: true, startAt: true, endAt: true, status: true },
      });
      if (!spot) throw new NotFoundException('Spot không tồn tại');
      if (spot.status !== MentorSpotStatus.AVAILABLE) throw new ConflictException('Spot không khả dụng');
      if (spot.startAt.getTime() <= Date.now()) throw new BadRequestException('Không thể đặt slot trong quá khứ');

      // 2) Exam hợp lệ cho user & chưa có InterviewRequest
      const exam = await tx.exam.findFirst({
        where: { id: examId, userId },
        select: { id: true, examStatus: true },
      });
      if (!exam) throw new NotFoundException('Exam không hợp lệ cho người dùng');
      if (exam.examStatus === ExamStatus.INTERVIEW_SCHEDULED) {
        throw new ConflictException('Bài thi đã được đặt lịch phỏng vấn');
      }
      const existedReq = await tx.interviewRequest.findUnique({ where: { examId } });
      if (existedReq) throw new ConflictException('Exam đã có InterviewRequest');

      // 3) Giữ chỗ: AVAILABLE -> HELD (optimistic)
      const hold = await tx.mentorTimeSpot.updateMany({
        where: { id: spotId, status: MentorSpotStatus.AVAILABLE },
        data: { status: MentorSpotStatus.HELD },
      });
      if (hold.count !== 1) throw new ConflictException('Spot vừa bị người khác giữ');

      // 4) Tạo InterviewRequest gắn mentorTimeSpotId (UNIQUE)
      // interviewDate = local-midnight (theo timezone) của startAt để tiện filter theo ngày
      const localStart = toZonedTime(spot.startAt, timezone);
      const dayStr = `${localStart.getFullYear()}-${String(localStart.getMonth() + 1).padStart(2, '0')}-${String(
        localStart.getDate()
      ).padStart(2, '0')}`;
      const interviewDateLocalMidnight = fromZonedTime(new Date(`${dayStr} 00:00:00`), timezone);

      const interview = await tx.interviewRequest.create({
        data: {
          examId,
          interviewDate: interviewDateLocalMidnight,
          mentorTimeSpotId: spot.id,
          // timeSlot: null, // bỏ dùng
        },
        select: { id: true },
      });

      // (optional) nếu dùng MentorBooking song hành
      await tx.mentorBooking.create({
        data: { mentorId: spot.mentorId, interviewRequestId: interview.id, status: 'PENDING', notes: note },
      });

      // 5) Đánh dấu exam đã schedule
      await tx.exam.update({
        where: { id: examId },
        data: { examStatus: ExamStatus.INTERVIEW_SCHEDULED },
      });

      // 6) Chốt: HELD -> BOOKED
      await tx.mentorTimeSpot.update({
        where: { id: spotId },
        data: { status: MentorSpotStatus.BOOKED },
      });

      return new ResponseItem<BookSpotResponseDto>(
        {
          spotId: spot.id,
          mentorId: spot.mentorId,
          examId,
          interviewRequestId: interview.id,
          startAt: spot.startAt.toISOString(),
          endAt: spot.endAt.toISOString(),
          status: MentorSpotStatus.BOOKED,
        },
        'Đặt lịch phỏng vấn thành công',
        BookSpotResponseDto
      );
    });
  }

  async cancelBookedSpot(spotId: string, examId: string, _userId?: string): Promise<ResponseItem<BookSpotResponseDto>> {
    return await this.prisma.$transaction(async (tx) => {
      const spot = await tx.mentorTimeSpot.findUnique({
        where: { id: spotId },
        select: {
          id: true,
          mentorId: true,
          startAt: true,
          endAt: true,
          status: true,
          interviewRequest: { select: { id: true, examId: true } },
        },
      });
      if (!spot) throw new NotFoundException('Spot không tồn tại');

      const cancellableStatuses: MentorSpotStatus[] = [MentorSpotStatus.BOOKED, MentorSpotStatus.HELD];

      if (!cancellableStatuses.includes(spot.status)) {
        throw new ConflictException('Spot không ở trạng thái có thể hủy');
      }
      if (spot.startAt.getTime() <= Date.now()) {
        throw new BadRequestException('Slot đã bắt đầu hoặc đã qua');
      }

      // Xóa đúng InterviewRequest gắn với exam id
      if (spot.interviewRequest?.examId && spot.interviewRequest.examId !== examId) {
        throw new ConflictException('Spot này đang gắn với exam khác');
      }
      await tx.interviewRequest.deleteMany({
        where: { mentorTimeSpotId: spot.id, examId },
      });

      // (optional) hủy MentorBooking nếu có
      await tx.mentorBooking.deleteMany({ where: { interviewRequestId: spot.interviewRequest?.id } });

      // Trả spot về AVAILABLE
      await tx.mentorTimeSpot.update({
        where: { id: spot.id },
        data: { status: MentorSpotStatus.AVAILABLE },
      });

      // (optional) revert trạng thái exam nếu policy: SUBMITTED/WAITING_FOR_REVIEW...
      await tx.exam.update({ where: { id: examId }, data: { examStatus: ExamStatus.SUBMITTED } });

      return new ResponseItem<BookSpotResponseDto>(
        {
          spotId: spot.id,
          mentorId: spot.mentorId,
          examId,
          interviewRequestId: spot.interviewRequest?.id ?? '',
          startAt: spot.startAt.toISOString(),
          endAt: spot.endAt.toISOString(),
          status: MentorSpotStatus.AVAILABLE,
        },
        'Hủy đặt lịch thành công',
        BookSpotResponseDto
      );
    });
  }
}
