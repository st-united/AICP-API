import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HasTakenExamResponseDto } from './dto/response/has-taken-exam-response.dto';
import { ResponseItem } from '@app/common/dtos';
import { CompetencyDimension, Exam, ExamLevelEnum, ExamSet, ExamStatus, SFIALevel } from '@prisma/client';
import { examSetDefaultName, Order, UserRoleEnum } from '@Constant/enums';
import { GetHistoryExamDto } from './dto/request/history-exam.dto';
import { HistoryExamResponseDto } from './dto/response/history-exam-response.dto';
import * as dayjs from 'dayjs';
import { DetailExamResponseDto } from './dto/response/detail-exam-response.dto';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { formatLevel } from '@Constant/format';
import { DATE_TIME } from '@Constant/datetime';
import { ExamWithResultDto, UserWithExamsResponseDto } from './dto/response/exam-with-result.dto';
import { UsersWithExamsFilters } from './dto/request/user-with-exams-filters.dto';
import { VerifyExamResponseDto } from './dto/response/verify-exam-response.dto';
import { UpdateTestTimeDto } from './dto/request/update-exam.dto';

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

  private async countUserExams(userId: string, examSetName: string): Promise<number> {
    return this.prisma.exam.count({
      where: {
        userId,
        examSet: {
          name: examSetName,
          isActive: true,
        },
        examStatus: {
          in: [
            ExamStatus.SUBMITTED,
            ExamStatus.WAITING_FOR_REVIEW,
            ExamStatus.GRADED,
            ExamStatus.INTERVIEW_SCHEDULED,
            ExamStatus.INTERVIEW_COMPLETED,
            ExamStatus.RESULT_EVALUATED,
          ],
        },
      },
    });
  }

  async hasTakenExam(params: { userId: string; examSetName: string }): Promise<ResponseItem<VerifyExamResponseDto>> {
    const examSet = await this.findExamSet({
      name: params.examSetName,
      userId: params.userId,
    });

    const exam = examSet.exam[0];
    const totalExams = await this.countUserExams(params.userId, params.examSetName);

    if (!exam) {
      return new ResponseItem<VerifyExamResponseDto>(
        {
          id: null,
          examStatus: null,
          examSetName: params.examSetName,
          examSetDuration: examSet.timeLimitMinutes,
          totalExams: 0,
        },
        'Người dùng chưa làm bài thi'
      );
    }

    return new ResponseItem<VerifyExamResponseDto>(
      {
        id: exam.id,
        examStatus: exam.examStatus,
        examSetName: examSet.name,
        examSetDuration: examSet.timeLimitMinutes,
        totalExams,
      },
      'Lấy thông tin bài thi thành công'
    );
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
      const where: any = {
        userId: userId,
      };

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
          createdAt: 'desc',
        },
        select: {
          id: true,
          examStatus: true,
          sfiaLevel: true,
          examSet: {
            select: {
              id: true,
              name: true,
            },
          },
          examLevel: {
            select: {
              examLevel: true,
            },
          },
          createdAt: true,
        },
      });

      const result = exams.map((exam, idx) => ({
        ...exam,
        attempt: idx + 1,
        isLatest: idx === 0,
      }));

      return new ResponseItem<HistoryExamResponseDto[]>(result, 'Lấy lịch sử thi thành công');
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
          examLevel: {
            select: {
              examLevel: true,
            },
          },
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

  async generateCertificateByExamId(examId: string, userId: string): Promise<{ buffer: Buffer; date: Date }> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId, userId },
      include: { user: true, examSet: true },
    });

    if (!exam) throw new NotFoundException('Exam not found');
    const rootDir = process.cwd();
    const templatePath = path.resolve(rootDir, 'public/templates/certificate/certificate.hbs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const cssPath = path.resolve(rootDir, 'public/templates/certificate/certificate.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const logoPath = path.resolve(rootDir, 'public/templates/certificate/images/logo.png');
    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
    const stampPath = path.resolve(rootDir, 'public/templates/certificate/images/stamp.png');
    const stampBase64 = fs.readFileSync(stampPath, { encoding: 'base64' });
    const backgroundPath = path.resolve(rootDir, 'public/templates/certificate/images/background.png');
    const backgroundBase64 = fs.readFileSync(backgroundPath, { encoding: 'base64' });
    const medalPath = path.resolve(rootDir, 'public/templates/certificate/images/medal.png');
    const medalBase64 = fs.readFileSync(medalPath, { encoding: 'base64' });

    const compiled = handlebars.compile(template);

    const html = compiled({
      fullName: exam.user.fullName,
      date: new Date(exam.updatedAt).toLocaleDateString(DATE_TIME.DAY_VN),
      level: exam.sfiaLevel ? formatLevel(exam.sfiaLevel) : 'Level: Bạn chưa được đánh giá',
      styles: css,
      logo: `data:image/png;base64,${logoBase64}`,
      stamp: `data:image/png;base64,${stampBase64}`,
      background: `data:image/png;base64,${backgroundBase64}`,
      medal: `data:image/png;base64,${medalBase64}`,
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-crash-reporter',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-component-extensions-with-background-pages',
        '--mute-audio',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const contentHeight = await page.evaluate(() => document.body.scrollHeight);
      const contentWidth = await page.evaluate(() => document.body.scrollWidth);

      const uint8Array = await page.pdf({
        width: `${contentWidth}px`,
        height: `${contentHeight}px`,
        printBackground: true,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      return {
        buffer: Buffer.from(uint8Array),
        date: exam.updatedAt,
      };
    } finally {
      await browser.close();
    }
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

    const diffMs = new Date(existingExam.finishedAt).getTime() - new Date(existingExam.startedAt).getTime();
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

    const result = await this.getCoursesByExamLevel(userId);

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

  async getCoursesByExamLevel(userId: string) {
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

  async getUsersWithExams(filters: UsersWithExamsFilters = {}): Promise<ResponseItem<UserWithExamsResponseDto[]>> {
    try {
      const { fromDate, toDate, university } = filters;

      const whereClause: any = {
        roles: {
          some: {
            role: {
              name: UserRoleEnum.USER,
            },
          },
        },
      };

      if (fromDate || toDate) {
        whereClause.createdAt = {};
        if (fromDate) whereClause.createdAt.gte = fromDate;
        if (toDate) whereClause.createdAt.lte = toDate;
      }

      if (university) {
        whereClause.university = {
          equals: university,
        };
      }

      const users = await this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          position: true,
          createdAt: true,
          updatedAt: true,
          university: true,
          userExam: {
            select: {
              id: true,
              startedAt: true,
              sfiaLevel: true,
              examLevel: {
                select: {
                  examLevel: true,
                },
              },
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
          },
        },
      });

      const processedUsers: UserWithExamsResponseDto[] = users.map((user) => {
        const processedExams: DetailExamResponseDto[] = user.userExam.map((exam) => {
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

          return {
            ...rest,
            overallScore: Number(overallScore),
            ...pillarScores,
          };
        });

        return {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            position: user.position,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            university: user.university,
          },
          exams: processedExams,
        };
      });

      return new ResponseItem<UserWithExamsResponseDto[]>(
        processedUsers,
        'Lấy danh sách người dùng và các bài thi thành công'
      );
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Lỗi khi lấy danh sách người dùng và các bài thi');
    }
  }

  async canScheduleExam(userId: string, examSetName: string): Promise<ResponseItem<boolean>> {
    try {
      const exams = await this.prisma.exam.findMany({
        where: {
          userId,
          examSet: {
            name: examSetName,
            isActive: true,
          },
        },
      });

      if (!exams?.length) {
        return new ResponseItem<boolean>(false, 'Bài thi chưa được làm');
      }

      const hasScheduled = exams.some((exam) => exam.examStatus === ExamStatus.INTERVIEW_SCHEDULED);

      return new ResponseItem<boolean>(
        !!hasScheduled,
        hasScheduled ? 'Bài thi đã được đặt lịch' : 'Bài thi chưa được đặt lịch'
      );
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Lỗi khi kiểm tra trạng thái đặt lịch bài thi');
    }
  }

  async updateTestTime(examId: string, updateTestTimeDto: UpdateTestTimeDto): Promise<ResponseItem<null>> {
    try {
      const existingExam = await this.prisma.exam.findUnique({
        where: { id: examId },
      });
      if (!existingExam) {
        throw new NotFoundException('Không tìm thấy bài làm');
      }
      await this.prisma.exam.update({
        where: { id: examId },
        data: {
          ...(updateTestTimeDto.startedAt && { startedAt: updateTestTimeDto.startedAt }),
          ...(updateTestTimeDto.finishedAt && { finishedAt: updateTestTimeDto.finishedAt }),
        },
      });

      return new ResponseItem(null, 'Cập nhật thời gian thi thành công');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(error);
      throw new BadRequestException('Lỗi khi cập nhật thời gian thi');
    }
  }
}
