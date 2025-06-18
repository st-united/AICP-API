import { ExamStatus } from '@prisma/client';

export interface ExamSetWithQuestions {
  id: string;
  name: string;
  description?: string;
  timeLimitMinutes: number;
  setQuestion: Array<{
    question: {
      id: string;
      type: string;
      content: string;
      subcontent?: string;
      image?: string;
      sequence?: number;
      answerOptions: Array<{
        id: string;
        content: string;
        isCorrect: boolean;
        explanation?: string;
        selected?: boolean;
      }>;
      userAnswerText?: string;
      skill?: any;
      level?: any;
    };
  }>;
}

export interface UserExam {
  id: string;
  userId: string;
  examSetId?: string;
  examStatus: ExamStatus;
  startedAt: Date;
  finishedAt: Date;
}

export interface UserAnswer {
  id: string;
  examId: string;
  questionId: string;
  userId: string;
  answerText?: string;
  selections: Array<{
    answerOptionId: string;
  }>;
}
