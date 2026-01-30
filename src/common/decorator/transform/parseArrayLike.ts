import { Transform } from 'class-transformer';

/**
 * Parse "array-like" inputs into actual arrays for DTO fields.
 *
 * ✅ Accepted inputs:
 * - array: `[value1, value2, ...]` (commonly from JSON body or pre-parsed values)
 * - string : `'value1,value2,...'` or `'value'` (commonly from query/params, trims spaces)
 *
 * ✅ Behavior:
 * - `null | undefined | ''`  -> `undefined` (treat as "not provided")
 * - valid array-like value -> `[value1, value2, ...]`
 * - any other value          -> return as-is, so `@IsArray()` can throw a validation error
 *
 * Typical usage:
 * - Combine with `@IsArray()` for validation
 * - Add `@IsOptional()` if the field is optional
 *
 * @returns A `class-transformer` `@Transform` decorator that converts array-like values.
 */
export function ParseArrayLike() {
  return Transform(({ value }) => {
    if (value == null || value === '') return undefined;

    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }

    return value;
  });
}
