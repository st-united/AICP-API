import { CompetencyDimension } from '@prisma/client';

/**
 * Maps CompetencyDimension to its corresponding code letter.
 */
export function getDimensionPrefix(dimension: CompetencyDimension): string {
  switch (dimension) {
    case CompetencyDimension.MINDSET:
      return 'A';
    case CompetencyDimension.SKILLSET:
      return 'B';
    case CompetencyDimension.TOOLSET:
      return 'C';
    default:
      return 'X';
  }
}

/**
 * Generates an aspect representation code based on dimension and current count.
 * Format: A1, B2, C10
 */
export function generateAspectRepresent(dimension: CompetencyDimension, nextNumber: number): string {
  const prefix = getDimensionPrefix(dimension);
  return `${prefix}${nextNumber}`;
}
