import { QuestionType } from '@prisma/client';

export type ParsedRow = {
  fullName: string;
  emailRaw: string;
  phoneNumber?: string;
  password?: string;
  roleName?: string;
  createdAt?: Date;
};

export type PhoneConflictPolicy = 'skip' | 'nullify';

export interface ExamSetData {
  id: string;
  assessmentType: string;
  framework: { id: string } | null;
  frameworkId: string;
  setQuestion: Array<{
    question: QuestionData;
  }>;
}

export interface QuestionData {
  id: string;
  type: QuestionType;
  maxPossibleScore?: number;
  answerOptions: AnswerOption[];
  skill?: {
    aspectId: string | null;
    aspect?: {
      pillarId: string | null;
    };
  };
}

export interface AnswerOption {
  id: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface GradableQuestion {
  id: string;
  type: QuestionType;
  max: number;
  correctIds: string[];
  wrongIds: string[];
  multiAllCorrectIds?: string[];
  pillarId?: string | null;
  aspectId?: string | null;
}

export interface NonGradableQuestion {
  id: string;
  type: QuestionType;
  pillarId?: string | null;
  aspectId?: string | null;
}
