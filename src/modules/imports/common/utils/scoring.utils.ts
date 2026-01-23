import { QuestionType } from '@prisma/client';
import { SCORE_MAX, SCORE_MIN } from '../constants/users-exams';

export function randomOverall(): number {
  const v = SCORE_MIN + Math.random() * (SCORE_MAX - SCORE_MIN);
  return Math.min(SCORE_MAX, Math.round((v + Number.EPSILON) * 100) / 100);
}

export function jitter(base: number, spread = 0.3): number {
  const v = base + (Math.random() * 2 - 1) * spread;
  const clamped = Math.max(SCORE_MIN, Math.min(SCORE_MAX, v));
  return Math.round((clamped + Number.EPSILON) * 100) / 100;
}

/** Build a "correct/incorrect" plan to approximate target totalAuto */
export function buildScoringPlan(
  questions: Array<{
    id: string;
    type: QuestionType;
    max: number;
    correctIds: string[];
    wrongIds: string[];
    multiAllCorrectIds?: string[];
  }>,
  targetTotal: number
): Map<string, boolean> {
  const items = [...questions].sort(() => Math.random() - 0.5);
  let sum = 0;
  const plan = new Map<string, boolean>();

  for (const q of items) {
    const diffIfAdd = Math.abs(targetTotal - (sum + q.max));
    const diffIfSkip = Math.abs(targetTotal - sum);
    if (diffIfAdd <= diffIfSkip) {
      plan.set(q.id, true);
      sum += q.max;
    } else {
      plan.set(q.id, false);
    }
  }

  // one-pass local improvement
  let bestPlan = new Map(plan);
  let bestSum = sum;
  let bestDiff = Math.abs(targetTotal - bestSum);

  for (let i = 0; i < items.length; i++) {
    const q = items[i];
    const was = bestPlan.get(q.id)!;
    const newSum = was ? bestSum - q.max : bestSum + q.max;
    const newDiff = Math.abs(targetTotal - newSum);
    if (newDiff < bestDiff) {
      bestPlan.set(q.id, !was);
      bestSum = newSum;
      bestDiff = newDiff;
    }
  }

  return bestPlan;
}

export function pickSelectionsForDecision(
  q: {
    type: QuestionType;
    correctIds: string[];
    wrongIds: string[];
    multiAllCorrectIds?: string[];
  },
  wantCorrect: boolean
): string[] {
  if (q.type === QuestionType.ESSAY) return [];

  if (q.type === QuestionType.MULTIPLE_CHOICE) {
    if (wantCorrect) {
      return q.multiAllCorrectIds && q.multiAllCorrectIds.length ? [...q.multiAllCorrectIds] : [...q.correctIds];
    }
    if (q.wrongIds.length) {
      return [q.wrongIds[Math.floor(Math.random() * q.wrongIds.length)]];
    }
    if (q.correctIds.length > 1) {
      const subset = [...q.correctIds];
      subset.splice(Math.floor(Math.random() * subset.length), 1);
      return subset;
    }
    return [];
  }

  // SINGLE_CHOICE-like
  if (wantCorrect && q.correctIds.length) {
    return [q.correctIds[Math.floor(Math.random() * q.correctIds.length)]];
  }
  if (!wantCorrect && q.wrongIds.length) {
    return [q.wrongIds[Math.floor(Math.random() * q.wrongIds.length)]];
  }
  return q.correctIds.length ? [q.correctIds[0]] : [];
}
