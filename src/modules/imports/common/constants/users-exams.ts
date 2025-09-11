import { PhoneConflictPolicy } from '@app/modules/imports/common/types/users-exams';

export const DEBUG_EXCEL = process.env.DEBUG_EXCEL === 'true';
export const DEFAULT_ROLE_NAME = 'user';

export const PHONE_CONFLICT_POLICY: PhoneConflictPolicy =
  (process.env.PHONE_CONFLICT_POLICY as PhoneConflictPolicy) || 'skip';

export const SCORE_MIN = 2;
export const SCORE_MAX = 4;

export const DEFAULT_PW = 'Temp@123';
export const DEFAULT_TZ = 'UTC';
