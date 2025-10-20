import { ExamLevelEnum, SFIALevel } from '@prisma/client';

export function mapExamLevelToSFIALevel(level: ExamLevelEnum): SFIALevel {
  const mapping: Record<ExamLevelEnum, SFIALevel> = {
    [ExamLevelEnum.LEVEL_1_STARTER]: SFIALevel.LEVEL_1_AWARENESS,
    [ExamLevelEnum.LEVEL_2_EXPLORER]: SFIALevel.LEVEL_2_FOUNDATION,
    [ExamLevelEnum.LEVEL_3_PRACTITIONER]: SFIALevel.LEVEL_3_APPLICATION,
    [ExamLevelEnum.LEVEL_4_INTEGRATOR]: SFIALevel.LEVEL_4_INTEGRATION,
    [ExamLevelEnum.LEVEL_5_STRATEGIST]: SFIALevel.LEVEL_5_INNOVATION,
    [ExamLevelEnum.LEVEL_6_LEADER]: SFIALevel.LEVEL_6_LEADERSHIP,
    [ExamLevelEnum.LEVEL_7_EXPERT]: SFIALevel.LEVEL_7_MASTERY,
  };
  return mapping[level];
}

export function calcElapsed(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const h = Math.floor(diffMs / 3600000)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((diffMs % 3600000) / 60000)
    .toString()
    .padStart(2, '0');
  const s = Math.floor((diffMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function mapQuestionsWithAnswers(examQuestions: any[], userAnswers: any[]) {
  const userAnswerMap: Record<string, string[]> = {};
  userAnswers.forEach((ua) => (userAnswerMap[ua.questionId] = ua.selections.map((s) => s.answerOptionId)));

  let correctCount = 0,
    wrongCount = 0,
    skippedCount = 0;

  const questions = examQuestions.map((q) => {
    const opts = q.question.answerOptions;
    const correct = opts.filter((o) => o.isCorrect).map((o) => o.id);
    const selected = userAnswerMap[q.questionId] || [];

    let status: 'correct' | 'wrong' | 'skipped';
    if (!selected.length) {
      skippedCount++;
      status = 'skipped';
    } else if (selected.every((id) => correct.includes(id)) && correct.length === selected.length) {
      correctCount++;
      status = 'correct';
    } else {
      wrongCount++;
      status = 'wrong';
    }

    return {
      questionId: q.questionId,
      question: q.question.content,
      answers: opts,
      userAnswers: selected,
      sequence: q.question.sequence,
      status,
    };
  });

  questions.sort((a, b) => a.sequence - b.sequence);
  return { correctCount, wrongCount, skippedCount, questions };
}
