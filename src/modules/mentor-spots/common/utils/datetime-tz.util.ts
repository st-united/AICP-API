import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { BadRequestException } from '@nestjs/common';
import { parse as parseDate, isValid as isValidDate, format as formatDate } from 'date-fns';

export type TimeWindow = { start: string; end: string };

/** 'HH:mm' -> phút từ 00:00 */
export function parseHHMM(label: string): number {
  if (typeof label !== 'string' || !/^[0-2]\d:[0-5]\d$/.test(label)) {
    throw new BadRequestException(`Invalid time label "${label}" (expected HH:mm)`);
  }
  const [h, m] = label.split(':').map(Number);
  if (h > 23 || m > 59) throw new BadRequestException(`Hour/minute out of range: "${label}"`);
  return h * 60 + m;
}

/** Chia đoạn [startMin, endMin) thành các slot duration phút */
export function splitToSlots(startMin: number, endMin: number, duration: number) {
  if (!Number.isInteger(duration) || duration <= 0) {
    throw new BadRequestException('duration must be a positive integer (minutes)');
  }
  const out: Array<{ start: number; end: number }> = [];
  for (let m = startMin; m + duration <= endMin; m += duration) {
    out.push({ start: m, end: m + duration });
  }
  return out;
}

/** Ném lỗi nếu IANA TZ không hợp lệ (date-fns-tz sẽ throw RangeError) */
export function ensureValidTz(tz: string) {
  try {
    fromZonedTime(new Date(0), tz);
  } catch {
    throw new BadRequestException('Invalid IANA timezone');
  }
}

/** Chống chồng lấn các window trong 1 ngày */
export function validateWindowsNonOverlapping(date: string, windows: TimeWindow[]) {
  const segs = windows.map((w) => ({ s: parseHHMM(w.start), e: parseHHMM(w.end), raw: w })).sort((a, b) => a.s - b.s);

  for (let i = 0; i < segs.length; i++) {
    const { s, e, raw } = segs[i];
    if (s >= e) throw new BadRequestException(`Invalid window ${date} ${raw.start}-${raw.end}`);
    if (i > 0 && s < segs[i - 1].e) throw new BadRequestException(`Overlapped windows on ${date}`);
  }
}

/** dateLocal 'YYYY-MM-DD' + phút local -> UTC instants theo IANA tz */
export function localMinutesToUtc(dateLocal: string, startMin: number, endMin: number, tz: string) {
  const startLocalStr = `${dateLocal} ${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')}`;
  const endLocalStr = `${dateLocal} ${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

  const startLocal = parseDate(startLocalStr, 'yyyy-MM-dd HH:mm', new Date());
  const endLocal = parseDate(endLocalStr, 'yyyy-MM-dd HH:mm', new Date());
  if (!isValidDate(startLocal) || !isValidDate(endLocal)) {
    throw new BadRequestException('Invalid date/time');
  }

  const startAt = fromZonedTime(startLocal, tz);
  const endAt = fromZonedTime(endLocal, tz);
  return { startAt, endAt };
}

/** Format UTC Date -> {date:'YYYY-MM-DD', time:'HH:mm'} theo TZ (để render FE) */
export function formatUtcToLocalParts(utc: Date, tz: string) {
  const zoned = toZonedTime(utc, tz);
  return {
    date: formatDate(zoned, 'yyyy-MM-dd'),
    time: formatDate(zoned, 'HH:mm'),
  };
}
