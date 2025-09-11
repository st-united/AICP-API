import { DEFAULT_ROLE_NAME } from '../constants/users-exams';

export function norm(h?: string): string {
  return (h || '').trim().toLowerCase().replace(/\s+/g, '');
}

export function sanitizeEmail(s: string): string | null {
  if (!s) return null;
  const e = String(s).trim().toLowerCase();
  if (e === '[object object]') return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

export function normalizeVNPhone(raw?: string | null): string | null {
  if (!raw) return null;
  let s = String(raw).replace(/[^\d]/g, '');
  if (!s) return null;
  if (s.startsWith('84') && s.length >= 10) s = '0' + s.slice(2);
  if (s.startsWith('0')) return s;
  if (/^\d{9,11}$/.test(s)) return '0' + s;
  return s;
}

const ROLE_NAME_MAP: Record<string, string> = {
  superadmin: 'super admin',
  'super admin': 'super admin',
  admin: 'admin',
  company: 'company',
  examiner: 'examiner',
  mentor: 'mentor',
  user: 'user',
  member: 'user',
  student: 'user',
};

export function mapRoleName(input?: string): string {
  const v = (input || '').trim().toLowerCase();
  if (!v) return DEFAULT_ROLE_NAME;
  return ROLE_NAME_MAP[v] || v;
}
