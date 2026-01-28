import { Transform } from 'class-transformer';

/**
 * Parse "boolean-like" inputs into actual booleans for DTO fields.
 *
 * ✅ Accepted inputs:
 * - boolean: `true | false` (commonly from JSON body or pre-parsed values)
 * - string : `'true' | 'false'` (commonly from query/params, case-insensitive, trims spaces)
 *
 * ✅ Behavior:
 * - `null | undefined | ''`  -> `undefined` (treat as "not provided")
 * - valid boolean-like value -> `true | false`
 * - any other value          -> return as-is, so `@IsBoolean()` can throw a validation error
 *
 * Typical usage:
 * - Combine with `@IsBoolean()` for validation
 * - Add `@IsOptional()` if the field is optional
 *
 * @returns A `class-transformer` `@Transform` decorator that converts boolean-like values.
 */
export function ParseBooleanLike() {
  return Transform(({ value }) => {
    if (value == null || value === '') return undefined;

    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true') return true;
      if (v === 'false') return false;
    }

    return value;
  });
}
