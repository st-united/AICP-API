import { Prisma } from '@prisma/client';

/**
 * Creates a search condition for Vietnamese text with accent-aware matching
 *
 * @param columnName - The database column name to search (e.g., "name", "title")
 * @param keyword - The search keyword from user input
 * @returns Prisma.Sql - SQL condition that can be used in WHERE clause
 *
 * @example
 * const searchCondition = createVietnameseSearchCondition('name', 'quy');
 * // Returns: unaccent_immutable(LOWER("name")) LIKE '%quy%'
 *
 * const searchCondition = createVietnameseSearchCondition('name', 'quý');
 * // Returns: LOWER("name") LIKE '%quý%'
 *
 * @description
 * - If keyword has NO accents → searches unaccented (matches all variations)
 * - If keyword HAS accents → searches with exact accents (case-insensitive)
 */
export function createVietnameseSearchCondition(columnExpr: string, keyword?: string): Prisma.Sql {
  const trimmedKeyword = (keyword ?? '').trim();

  if (!trimmedKeyword) {
    return Prisma.sql`TRUE`;
  }

  const normalizedKeyword = trimmedKeyword.toLowerCase();
  const searchPattern = `%${normalizedKeyword}%`;

  return Prisma.sql`
    CASE
      WHEN ${normalizedKeyword} = unaccent_immutable(${normalizedKeyword}) THEN
        unaccent_immutable(LOWER(${Prisma.raw(columnExpr)})) LIKE ${searchPattern}
      ELSE
        LOWER(${Prisma.raw(columnExpr)}) LIKE ${searchPattern}
    END
  `;
}

/**
 * Creates multiple search conditions combined with OR
 *
 * @param columns - Array of column names to search
 * @param keyword - The search keyword from user input
 * @returns Prisma.Sql - SQL condition with OR logic
 *
 * @example
 * const searchCondition = createMultiColumnVietnameseSearch(['name', 'description'], 'quy');
 * // Searches in both name and description columns
 */
export function createMultiColumnVietnameseSearch(columns: string[], keyword: string): Prisma.Sql {
  const trimmedKeyword = (keyword ?? '').trim();

  if (trimmedKeyword.length === 0 || columns.length === 0) {
    return Prisma.sql`TRUE`;
  }

  const conditions = columns.map((col) => createVietnameseSearchCondition(col, trimmedKeyword));

  // Combine conditions with OR
  return Prisma.sql`(${Prisma.join(conditions, ' OR ')})`;
}
