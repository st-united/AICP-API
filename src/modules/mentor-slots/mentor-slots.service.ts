import { GoogleCalendarService } from '@app/common/helpers/google-calendar.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MentorSpotStatus } from '@Constant/enums';
import * as pLimit from 'p-limit';

import { CreateMentorSlotsDto } from './dto/request/create-mentor-slots.dto';
import { MentorCalendarResponseDto } from './dto/response/mentor-calendar-response.dto';
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const TZ_DEFAULT = 'Asia/Ho_Chi_Minh';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class MentorSlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBulkSlots(dto: CreateMentorSlotsDto, userId?: string) {
    const {
      timezone: tzInput,
      durationMin,
      bufferMinutes = 0,
      defaultStatus = MentorSpotStatus.AVAILABLE,
      availabilities,
      conflictPolicy = 'SKIP',
      deletedSlotIds,
    } = dto;

    const tz = tzInput || TZ_DEFAULT;
    const normalizedDeletedSlotIds = Array.isArray(deletedSlotIds) ? Array.from(new Set(deletedSlotIds)) : [];
    const hasAvailabilities = Array.isArray(availabilities) && availabilities.length > 0;
    const hasDeletions = normalizedDeletedSlotIds.length > 0;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!hasAvailabilities && !hasDeletions) {
      throw new BadRequestException('availabilities or deletedSlotIds is required');
    }

    if (hasAvailabilities && !durationMin) {
      throw new BadRequestException('durationMin is required');
    }

    const mentor = await this.prisma.mentor.findUnique({
      where: { userId },
      select: {
        id: true,
        user: { select: { email: true } },
      },
    });

    if (!mentor) {
      throw new BadRequestException(`Mentor not found for user: ${userId}`);
    }

    if (!mentor.user?.email) {
      throw new BadRequestException('Mentor email is required');
    }

    const mentorEmail = mentor.user.email;
    const rawCalendarConcurrency = Number(process.env.MENTOR_SLOTS_CALENDAR_CONCURRENCY ?? 5);
    const calendarConcurrency = Number.isFinite(rawCalendarConcurrency)
      ? Math.max(1, Math.min(20, Math.trunc(rawCalendarConcurrency)))
      : 5;
    const limitCalendar = pLimit(calendarConcurrency);
    const safeDeleteCalendarEvents = async (eventIds: string[]) => {
      if (!eventIds.length) return;

      await Promise.all(
        eventIds.map((eventId) =>
          limitCalendar(async () => {
            try {
              await GoogleCalendarService.deleteEvent(eventId);
            } catch (error) {
              console.error(`Error deleting Google Calendar event ${eventId}:`, error);
            }
          })
        )
      );
    };

    let deletedCount = 0;

    if (hasDeletions) {
      const slotsToDelete = await this.prisma.mentorTimeSpot.findMany({
        where: {
          mentorId: mentor.id,
          id: { in: normalizedDeletedSlotIds },
        },
        select: {
          id: true,
          status: true,
          calendarEventId: true,
        },
      });

      const bookedSlots = slotsToDelete.filter((slot) => slot.status === MentorSpotStatus.BOOKED);
      if (bookedSlots.length) {
        throw new BadRequestException(`Cannot delete booked slots: ${bookedSlots.map((slot) => slot.id).join(', ')}`);
      }

      await safeDeleteCalendarEvents(
        slotsToDelete.map((slot) => slot.calendarEventId).filter((eventId): eventId is string => Boolean(eventId))
      );

      if (slotsToDelete.length) {
        const deleteResult = await this.prisma.mentorTimeSpot.deleteMany({
          where: { mentorId: mentor.id, id: { in: slotsToDelete.map((slot) => slot.id) } },
        });
        deletedCount = deleteResult.count;
      }
    }

    type SlotInput = {
      mentorId: string;
      startAt: Date;
      endAt: Date;
      durationMinutes: number;
      timezone: string;
      status: MentorSpotStatus;
    };

    const slots: SlotInput[] = [];

    const addSlotsForRange = (rangeStart: any, rangeEnd: any) => {
      let t = rangeStart;

      while (true) {
        const slotStart = t;
        const slotEnd = t.add(durationMin, 'minute');

        if (slotEnd.isAfter(rangeEnd)) break;

        slots.push({
          mentorId: mentor.id,
          startAt: slotStart.toDate(),
          endAt: slotEnd.toDate(),
          durationMinutes: durationMin,
          timezone: tz,
          status: defaultStatus,
        });

        t = slotEnd.add(bufferMinutes, 'minute');
      }
    };

    if (hasAvailabilities) {
      for (const availability of availabilities!) {
        const date = dayjs.tz(availability.date, 'YYYY-MM-DD', tz);

        if (!date.isValid()) {
          throw new BadRequestException(`date invalid. Expected YYYY-MM-DD: ${availability.date}`);
        }

        for (const r of availability.ranges) {
          const rangeStart = dayjs.tz(`${availability.date} ${r.start}`, 'YYYY-MM-DD HH:mm', tz);
          const rangeEnd = dayjs.tz(`${availability.date} ${r.end}`, 'YYYY-MM-DD HH:mm', tz);

          if (!rangeStart.isValid() || !rangeEnd.isValid()) continue;
          if (!rangeEnd.isAfter(rangeStart)) continue;

          addSlotsForRange(rangeStart, rangeEnd);
        }
      }
    }

    if (!slots.length) return { created: 0, deleted: deletedCount };

    const uniqueSlotsMap = new Map<number, SlotInput>();
    for (const slot of slots) {
      const key = slot.startAt.getTime();
      if (!uniqueSlotsMap.has(key)) {
        uniqueSlotsMap.set(key, slot);
      }
    }

    const uniqueSlots = Array.from(uniqueSlotsMap.values());
    if (!uniqueSlots.length) return { created: 0, deleted: deletedCount };

    const startAts = uniqueSlots.map((s) => s.startAt);

    const existing = await this.prisma.mentorTimeSpot.findMany({
      where: { mentorId: mentor.id, startAt: { in: startAts } },
      select: { id: true, startAt: true, calendarEventId: true },
    });

    if (existing.length && conflictPolicy === 'ERROR') {
      throw new BadRequestException(`Conflicts: ${existing.length} slots already exist`);
    }

    const existingSet = new Set(existing.map((e) => e.startAt.getTime()));

    const slotsToCreate =
      conflictPolicy === 'SKIP' ? uniqueSlots.filter((slot) => !existingSet.has(slot.startAt.getTime())) : uniqueSlots;

    if (!slotsToCreate.length) return { created: 0, deleted: deletedCount };

    const slotsWithMeetUrl = await Promise.all(
      slotsToCreate.map((slot) =>
        limitCalendar(async () => {
          let meetUrl: string | null = null;
          let calendarEventId: string | null = null;

          try {
            const eventInfo = await GoogleCalendarService.createInterviewEvent(mentorEmail, mentorEmail, {
              startAt: slot.startAt,
              endAt: slot.endAt,
              timezone: slot.timezone,
              meetUrl: null,
            });
            meetUrl = eventInfo.meetUrl;
            calendarEventId = eventInfo.eventId;
          } catch (error) {
            console.error('Error creating Google Calendar event for slot:', error);
            meetUrl = 'https://meet.google.com/default-link';
            calendarEventId = null;
          }

          return {
            ...slot,
            meetUrl,
            calendarEventId,
          };
        })
      )
    );

    if (conflictPolicy === 'REPLACE' && existing.length) {
      await safeDeleteCalendarEvents(
        existing.map((slot) => slot.calendarEventId).filter((eventId): eventId is string => Boolean(eventId))
      );

      return await this.prisma.$transaction(async (tx) => {
        await tx.mentorTimeSpot.deleteMany({
          where: { mentorId: mentor.id, startAt: { in: existing.map((e) => e.startAt) } },
        });

        const result = await tx.mentorTimeSpot.createMany({
          data: slotsWithMeetUrl,
          skipDuplicates: true,
        });

        return { created: result.count, deleted: deletedCount };
      });
    }

    const result = await this.prisma.mentorTimeSpot.createMany({
      data: slotsWithMeetUrl,
      skipDuplicates: true,
    });

    return { created: result.count, deleted: deletedCount };
  }

  async getMentorCalendar(params: {
    mentorUserId: string;
    from?: string;
    to?: string;
  }): Promise<MentorCalendarResponseDto> {
    const { mentorUserId, from, to } = params;

    const mentor = await this.prisma.mentor.findUnique({
      where: { userId: mentorUserId },
      select: { id: true },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor không tồn tại');
    }

    const fromDate = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 1));

    const toDate = to ? new Date(to) : new Date(new Date().setDate(new Date().getDate() + 7));

    const spots = await this.prisma.mentorTimeSpot.findMany({
      where: {
        mentorId: mentor.id,
        startAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: {
        startAt: 'asc',
      },
      include: {
        interviewRequest: {
          include: {
            exam: {
              select: {
                id: true,
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      data: spots.map((spot) => ({
        id: spot.id,
        startAt: spot.startAt,
        endAt: spot.endAt,
        status: spot.status,
        timezone: spot.timezone,
        meetUrl: spot.meetUrl,

        interview: spot.interviewRequest
          ? {
              examId: spot.interviewRequest.exam.id,
              userName: spot.interviewRequest.exam.user.fullName,
              userEmail: spot.interviewRequest.exam.user.email,
            }
          : null,
      })),
    };
  }

  async getMentorWeekCalendar(mentorUserId: string, from?: string, to?: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { userId: mentorUserId },
      select: { id: true },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor không tồn tại');
    }

    const fromDate = from ? new Date(from) : dayjs().startOf('week').toDate();

    const toDate = to ? new Date(to) : dayjs().endOf('week').toDate();

    const spots = await this.prisma.mentorTimeSpot.findMany({
      where: {
        mentorId: mentor.id,
        startAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { startAt: 'asc' },
      include: {
        interviewRequest: {
          include: {
            exam: {
              select: {
                id: true,
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      range: { from: fromDate, to: toDate },
      data: spots.map((spot) => ({
        id: spot.id,
        startAt: spot.startAt,
        endAt: spot.endAt,
        status: spot.status,
        timezone: spot.timezone,
        meetUrl: spot.meetUrl,

        interview: spot.interviewRequest
          ? {
              examId: spot.interviewRequest.exam.id,
              userName: spot.interviewRequest.exam.user.fullName,
              userEmail: spot.interviewRequest.exam.user.email,
            }
          : null,
      })),
    };
  }

  async getMentorMonthCalendar(mentorUserId: string, month: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { userId: mentorUserId },
      select: { id: true },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor không tồn tại');
    }

    const start = dayjs(month).startOf('month').toDate();
    const end = dayjs(month).endOf('month').toDate();

    const spots = await this.prisma.mentorTimeSpot.findMany({
      where: {
        mentorId: mentor.id,
        startAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        meetUrl: true,
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    return {
      month,
      events: spots.map((spot) => ({
        id: spot.id,
        date: dayjs(spot.startAt).format('YYYY-MM-DD'),
        startAt: spot.startAt,
        endAt: spot.endAt,
        status: spot.status,
        meetUrl: spot.meetUrl,
      })),
    };
  }
}
