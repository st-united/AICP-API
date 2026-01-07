import 'dayjs';

declare module 'dayjs' {
  interface Dayjs {
    tz(timezone: string): Dayjs;
  }

  export function tz(date?: string | number | Date, timezone?: string): Dayjs;
}
