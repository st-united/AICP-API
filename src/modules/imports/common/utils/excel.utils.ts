import * as ExcelJS from 'exceljs';
import { norm } from './normalize.utils';

// --- Descriptive predicates (constants) ---
const isPrimitiveScalar = (v: unknown): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

const hasPlainTextProp = (v: any): v is { text: string } => v != null && typeof v.text === 'string';

const hasRichTextUnderText = (v: any): v is { text: { richText: Array<{ text?: string }> } } =>
  v?.text && Array.isArray(v.text.richText);

const hasRichTextTopLevel = (v: any): v is { richText: Array<{ text?: string }> } => Array.isArray(v?.richText);

const hasCustomToString = (v: any): boolean =>
  typeof v?.toString === 'function' && v.toString !== Object.prototype.toString;

// --- Main function ---
export function excelAnyToString(v: any): string {
  if (v == null) return '';

  if (isPrimitiveScalar(v)) return String(v);

  if (hasPlainTextProp(v)) return v.text;

  if (hasRichTextUnderText(v)) {
    return v.text.richText.map((r) => r?.text ?? '').join('');
  }

  if (hasRichTextTopLevel(v)) {
    return v.richText.map((r) => r?.text ?? '').join('');
  }

  if (v?.result != null) return excelAnyToString(v.result);

  if (Array.isArray(v)) return v.map((x) => excelAnyToString(x)).join('');

  if (hasCustomToString(v)) {
    const s = String(v.toString());
    return s === '[object Object]' ? '' : s;
  }

  return '';
}
export function cellText(cell: ExcelJS.Cell): string {
  const raw = cell.value; // keep the declared type from ExcelJS

  if (raw == null) return ''; // early return for empty cells

  return excelAnyToString(raw).replace(/\r?\n/g, ' ').trim();
}

export function parseDateCell(cell: ExcelJS.Cell): Date | undefined {
  const raw = cell.value;

  if (raw == null) return undefined; // early return for empty cell
  if (raw instanceof Date) return raw; // ExcelJS sometimes gives Date directly

  const text = cellText(cell);
  if (!text) return undefined;

  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export function getHeaderIndexes(ws: ExcelJS.Worksheet) {
  const header = ws.getRow(1);
  let idxFull = -1;
  let idxEmail = -1;
  let idxPhone = -1;
  let idxPass = -1;
  let idxRole = -1;
  let idxCreatedAt = -1;

  header.eachCell((cell, colNumber) => {
    const name = norm(cellText(cell));
    if (name === 'fullname') idxFull = colNumber;
    else if (name === 'email') idxEmail = colNumber;
    else if (name === 'phonenumber') idxPhone = colNumber;
    else if (name === 'password') idxPass = colNumber;
    else if (name === 'role') idxRole = colNumber;
    else if (name === 'createdat') idxCreatedAt = colNumber;
  });

  return { idxFull, idxEmail, idxPhone, idxPass, idxRole, idxCreatedAt };
}
