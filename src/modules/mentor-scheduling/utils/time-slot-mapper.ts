// src/modules/mentor-spots/utils/time-slot-mapper.ts
import { TimeSlotBooking } from '@prisma/client';
import { toZonedTime } from 'date-fns-tz';

export function mapToTimeSlot(utcStartAt: Date, tz = 'Asia/Ho_Chi_Minh'): TimeSlotBooking {
  const z = toZonedTime(utcStartAt, tz);
  const h = z.getHours();

  if (h === 8) return TimeSlotBooking.AM_08_09;
  if (h === 9) return TimeSlotBooking.AM_09_10;
  if (h === 10) return TimeSlotBooking.AM_10_11;
  if (h === 11) return TimeSlotBooking.AM_11_12;
  if (h === 14) return TimeSlotBooking.PM_02_03;
  if (h === 15) return TimeSlotBooking.PM_03_04;
  if (h === 16) return TimeSlotBooking.PM_04_05;
  if (h === 17) return TimeSlotBooking.PM_05_06;

  throw new Error(`Không map được timeSlot từ giờ ${h}:00 tại tz ${tz}`);
}
