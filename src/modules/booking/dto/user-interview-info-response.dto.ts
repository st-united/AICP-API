import { SFIALevel } from '@prisma/client';

export class UserInterviewInfoDto {
  personalInfo: PersonalInfoDto;
  examResult: ExamResultDto;
  portfolio: PortfolioDto;
}

export class PersonalInfoDto {
  fullName: string;
  age: number | null;
  email: string;
  phoneNumber: string | null;
  province: string | null;
  job: string[];
}

export class ExamResultDto {
  sfiaLevel: SFIALevel | null;
  correctCount: number;
  totalQuestions: number;
  timeSpentMinutes: number | null;
  examDate: Date;
  overallScore: number;
  scores: {
    mindset: number;
    skillset: number;
    toolset: number;
  };
}

export class PortfolioDto {
  linkedin: string | null;
  github: string | null;
  certificates: string[] | null;
  experiences: string[] | null;
}
