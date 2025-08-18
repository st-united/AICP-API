import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HasTakenExamDto } from './dto/request/has-taken-exam.dto';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ResponseItem } from '@app/common/dtos';
import { CompetencyDimension, Exam, ExamLevelEnum, ExamSet, SFIALevel } from '@prisma/client';
import { examSetDefaultName } from '@Constant/enums';
import { GetHistoryExamDto } from './dto/request/history-exam.dto';
import { HistoryExamResponseDto } from './dto/response/history-exam-response.dto';
import * as dayjs from 'dayjs';
import { DetailExamResponseDto } from './dto/response/detail-exam-response.dto';
import { ExamWithResultDto } from './dto/response/exam-with-result.dto';

@Injectable()
export class ExamService {
  private readonly logger = new Logger(ExamService.name);

  constructor(private readonly prisma: PrismaService) {}

  private createExamResponse(examSet: ExamSet, exam: Exam, hasTaken: boolean): ResponseItem<HasTakenExamResponseDto> {
    const response: HasTakenExamResponseDto = {
      hasTakenExam: hasTaken,
      examSetDuration: examSet.timeLimitMinutes,
      examId: exam?.id,
      examStatus: exam?.examStatus,
    };
    return new ResponseItem(response, hasTaken ? 'Đã làm bài thi này' : 'Chưa làm bài thi này');
  }

  private async findExamSet(where: any) {
    try {
      const examSet = await this.prisma.examSet.findFirst({
        where: {
          ...(where.id && { id: where.id }),
          ...(where.name && { name: where.name }),
        },
        include: {
          exam: {
            where: { userId: where.userId },
            take: 1,
          },
        },
      });

      if (!examSet) {
        throw new NotFoundException('Bộ đề không tồn tại');
      }

      return examSet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);

      throw new BadRequestException('Lỗi khi kiểm tra bài thi đã được làm chưa');
    }
  }

  async hasTakenExam(params: HasTakenExamDto): Promise<ResponseItem<HasTakenExamResponseDto>> {
    const examSet = await this.findExamSet({ id: params.examSetId, userId: params.userId });
    const exam = examSet.exam[0];
    return this.createExamResponse(examSet, exam, !!exam);
  }

  async hasTakenExamInputTest(userId: string): Promise<ResponseItem<HasTakenExamResponseDto>> {
    const examSet = await this.findExamSet({
      name: examSetDefaultName.DEFAULT,
      userId,
    });
    const exam = examSet.exam[0];
    return this.createExamResponse(examSet, exam, !!exam);
  }

  async getHistoryExam(
    userId: string,
    historyExam: GetHistoryExamDto
  ): Promise<ResponseItem<HistoryExamResponseDto[]>> {
    try {
      const where: any = { userId: userId };

      if (historyExam.startDate || historyExam.endDate) {
        where.createdAt = {};

        if (historyExam.startDate) {
          where.createdAt.gte = dayjs(historyExam.startDate).startOf('day').toDate();
        }

        if (historyExam.endDate) {
          where.createdAt.lte = dayjs(historyExam.endDate).endOf('day').toDate();
        }
      }
      const exams = await this.prisma.exam.findMany({
        where,
        orderBy: {
          finishedAt: 'desc',
        },
        select: {
          id: true,
          examStatus: true,
          sfiaLevel: true,
          createdAt: true,
        },
      });

      return new ResponseItem<HistoryExamResponseDto[]>(exams, 'Lấy lịch sử thi thành công');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Lỗi khi lấy lịch sử thi');
    }
  }

  async getDetailExam(examId: string): Promise<ResponseItem<DetailExamResponseDto>> {
    try {
      const exam = await this.prisma.exam.findUnique({
        where: { id: examId },
        select: {
          id: true,
          startedAt: true,
          sfiaLevel: true,
          overallScore: true,
          examStatus: true,
          createdAt: true,
          examSet: {
            select: {
              id: true,
              name: true,
            },
          },
          examPillarSnapshot: {
            select: {
              pillar: {
                select: {
                  id: true,
                  name: true,
                },
              },
              score: true,
            },
          },
          examAspectSnapshot: {
            select: {
              aspect: {
                select: {
                  id: true,
                  name: true,
                  represent: true,
                  pillarId: true,
                },
              },
              score: true,
            },
          },
        },
      });

      if (!exam) throw new NotFoundException('Bài thi không tồn tại');

      const { examPillarSnapshot, examAspectSnapshot, overallScore, ...rest } = exam;

      const pillarsWithAspects = examPillarSnapshot.map((pillarSnapshot) => {
        const pillar = pillarSnapshot.pillar;

        const aspects = examAspectSnapshot
          .filter((aspectSnapshot) => aspectSnapshot.aspect.pillarId === pillar.id)
          .map((aspectSnapshot) => ({
            id: aspectSnapshot.aspect.id,
            name: aspectSnapshot.aspect.name,
            represent: aspectSnapshot.aspect.represent,
            score: Number(aspectSnapshot.score),
          }));

        return {
          id: pillar.id,
          name: pillar.name,
          score: Number(pillarSnapshot.score),
          aspects: aspects,
        };
      });

      const pillarScores = pillarsWithAspects.reduce(
        (acc, snapshot) => {
          const name = snapshot.name.toUpperCase();

          switch (name) {
            case CompetencyDimension.MINDSET:
              acc.mindsetScore = snapshot;
              break;
            case CompetencyDimension.SKILLSET:
              acc.skillsetScore = snapshot;
              break;
            case CompetencyDimension.TOOLSET:
              acc.toolsetScore = snapshot;
              break;
          }
          return acc;
        },
        {
          mindsetScore: null,
          skillsetScore: null,
          toolsetScore: null,
        }
      );

      const response: DetailExamResponseDto = {
        ...rest,
        overallScore: Number(overallScore),
        ...pillarScores,
      };

      return new ResponseItem<DetailExamResponseDto>(response, 'Lấy chi tiết bài thi thành công');
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Lỗi khi lấy chi tiết bài thi');
    }
  }

  async deleteExam(examId: string): Promise<ResponseItem<HasTakenExamResponseDto>> {
    const existingExam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!existingExam) {
      throw new NotFoundException('Bài kiểm tra không tồn tại.');
    }
    await this.prisma.exam.delete({
      where: { id: examId },
    });
    return new ResponseItem(null, 'Xoá bài làm thành công');
  }

  async getExamWithResult(examId: string, userId: string): Promise<ResponseItem<ExamWithResultDto>> {
    const existingExam = await this.prisma.exam.findUnique({
      where: { id: examId, userId },
    });

    if (!existingExam) {
      throw new NotFoundException('Bài thi không tồn tại');
    }

    const [examSet, examQuestions, userAnswers] = await Promise.all([
      this.prisma.examSet.findUnique({ where: { id: existingExam.examSetId } }),
      this.prisma.examSetQuestion.findMany({
        where: { examSetId: existingExam.examSetId },
        include: {
          question: {
            include: { answerOptions: true },
          },
        },
      }),
      this.prisma.userAnswer.findMany({
        where: {
          userId,
          examId,
        },
        include: {
          selections: true,
        },
      }),
    ]);

    if (!examSet) {
      throw new NotFoundException('Bộ đề thi không tồn tại');
    }

    const diffMs = new Date(existingExam.updatedAt).getTime() - new Date(existingExam.createdAt).getTime();
    const h = Math.floor(diffMs / 3600000)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((diffMs % 3600000) / 60000)
      .toString()
      .padStart(2, '0');
    const s = Math.floor((diffMs % 60000) / 1000)
      .toString()
      .padStart(2, '0');
    const elapsedTime = `${h}:${m}:${s}`;

    const userAnswerMap: Record<string, string[]> = {};
    userAnswers.forEach((ua) => {
      userAnswerMap[ua.questionId] = ua.selections.map((s) => s.answerOptionId);
    });

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const questions = examQuestions.map((q) => {
      const answerOptions = q.question.answerOptions.map((opt) => ({
        id: opt.id,
        content: opt.content,
        isCorrect: opt.isCorrect,
      }));

      const correctAnswers = answerOptions.filter((opt) => opt.isCorrect).map((opt) => opt.id);
      const userSelected = userAnswerMap[q.questionId] || [];

      let status: 'correct' | 'wrong' | 'skipped';

      if (userSelected.length === 0) {
        skippedCount++;
        status = 'skipped';
      } else {
        const allCorrectSelected =
          userSelected.every((ans) => correctAnswers.includes(ans)) && correctAnswers.length === userSelected.length;

        if (allCorrectSelected) {
          correctCount++;
          status = 'correct';
        } else {
          wrongCount++;
          status = 'wrong';
        }
      }

      return {
        questionId: q.questionId,
        question: q.question.content,
        answers: answerOptions,
        userAnswers: userSelected,
        sequence: q.question.sequence,
        status,
      };
    });

    questions.sort((a, b) => a.sequence - b.sequence);

    const examLevel = await this.prisma.examLevel.findUnique({
      where: { id: existingExam.examLevelId },
    });

    const result = await this.getCoursesByExamLevel(examLevel.examLevel, userId);

    return new ResponseItem<ExamWithResultDto>(
      {
        elapsedTime,
        questions,
        correctCount,
        wrongCount,
        skippedCount,
        level: examLevel?.name,
        description: examLevel?.description,
        learningPath: examLevel?.learningPath,
        recommendedCourses: result,
      },
      'Lấy kết quả bài thi thành công'
    );
  }

  private mapExamLevelToSFIALevel(level: ExamLevelEnum): SFIALevel {
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

  async getCoursesByExamLevel(_: ExamLevelEnum, userId: string) {
    const allCourses = await this.prisma.course.findMany({
      where: {
        isActive: true,
      },
      include: {
        userProgress: {
          where: {
            userId: userId,
          },
        },
      },
    });

    const coursesWithRegistrationStatus = allCourses.map((course) => {
      const { userProgress, ...courseData } = course;
      const isRegistered = userProgress.length > 0;

      return {
        ...courseData,
        isRegistered,
      };
    });

    return coursesWithRegistrationStatus;
  }
}
