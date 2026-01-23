import { SFIALevel } from '@prisma/client';

/**
 * Map overallScore → SFIA level theo ngưỡng hiện tại
 */
const LEVEL_THRESHOLDS: { threshold: number; level: SFIALevel }[] = [
  { threshold: 2, level: SFIALevel.LEVEL_1_AWARENESS },
  { threshold: 3, level: SFIALevel.LEVEL_2_FOUNDATION },
  { threshold: 4, level: SFIALevel.LEVEL_3_APPLICATION },
  { threshold: 5, level: SFIALevel.LEVEL_4_INTEGRATION },
  { threshold: 6, level: SFIALevel.LEVEL_5_INNOVATION },
  { threshold: 7, level: SFIALevel.LEVEL_6_LEADERSHIP },
];

export function getSFIALevel(overallScore: number): SFIALevel {
  const found = LEVEL_THRESHOLDS.find(({ threshold }) => overallScore < threshold);
  return found ? found.level : SFIALevel.LEVEL_7_MASTERY;
}
