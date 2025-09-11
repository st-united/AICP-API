import { Injectable, BadRequestException } from '@nestjs/common';
import {
  Prisma,
  QuestionType,
  ExamStatus,
  UserAnswerStatus,
  ReadyToWorkTier,
  ExamLevelEnum,
  AssessmentType,
  SFIALevel,
} from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as pLimit from 'p-limit';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { getSFIALevel } from '@app/common/utils/sfia.utils';
import {
  DEBUG_EXCEL,
  DEFAULT_PW,
  DEFAULT_ROLE_NAME,
  DEFAULT_TZ,
  PHONE_CONFLICT_POLICY,
  SCORE_MAX,
  SCORE_MIN,
} from './common/constants/users-exams';
import { ParsedRow } from './common/types/users-exams';
import {
  buildScoringPlan,
  cellText,
  getHeaderIndexes,
  hashPassword,
  jitter,
  mapRoleName,
  norm,
  normalizeVNPhone,
  parseDateCell,
  pickSelectionsForDecision,
  randomOverall,
  sanitizeEmail,
} from './common/utils';
import { Order } from '@Constant/enums';

// ------------------------
// Tunables
// ------------------------
const DEFAULT_BATCH_SIZE = Number(process.env.IMPORT_BATCH_SIZE ?? 200);
const DEFAULT_CONCURRENCY = Number(process.env.IMPORT_CONCURRENCY ?? 8);

// ------------------------
// Helper Types
// ------------------------

type GradableQuestion = {
  id: string;
  type: QuestionType;
  max: number;
  correctIds: string[];
  wrongIds: string[];
  multiAllCorrectIds?: string[];
  pillarId?: string | null;
  aspectId?: string | null;
};

type NonGradableQuestion = {
  id: string;
  type: QuestionType;
  pillarId?: string | null;
  aspectId?: string | null;
};

type Agg = Map<string, { raw: number; max: number }>;

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================
  // Public API
  // ========================

  async importUsersWithExamsFromExcel(
    file: Buffer,
    dto: { examSetId: string; sheetName?: string; scoring?: 'auto' | 'none' }
  ) {
    const { examSet, questions, frameworkId } = await this.loadExamSetWithQuestions(dto.examSetId);
    const roleMap = await this.loadRoleMap();

    const limit = pLimit(DEFAULT_CONCURRENCY);

    let createdUsers = 0;
    let createdExams = 0;
    let totalRows = 0;
    const logs: string[] = [];

    // Process the sheet in batches without holding everything in memory
    for await (const batch of this.readUsersSheetBatches(file, dto.sheetName ?? 'Users', DEFAULT_BATCH_SIZE)) {
      totalRows += batch.length;

      const results = await Promise.allSettled(
        batch.map((row) =>
          limit(() => this.processOneRow(row, { examSet, questions, frameworkId, roleMap, scoring: dto.scoring }))
        )
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          createdUsers += r.value.createdUsers;
          createdExams += r.value.createdExams;
          if (r.value.log) logs.push(r.value.log);
        } else {
          logs.push(`ERROR: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`);
        }
      }
    }

    return {
      examSetId: examSet.id,
      sheet: dto.sheetName ?? 'Users',
      createdUsers,
      createdExams,
      totalRows,
      logs,
    };
  }

  // ========================
  // Sheet Parsing (batched)
  // ========================

  /**
   * Stream-like batch reader. Loads workbook once but yields parsed rows in batches to avoid
   * building a giant in-memory array.
   */
  private async *readUsersSheetBatches(
    buf: Buffer,
    sheetName = 'Users',
    batchSize = DEFAULT_BATCH_SIZE
  ): AsyncGenerator<ParsedRow[]> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as any);

    const ws = wb.getWorksheet(sheetName) || wb.worksheets.find((w) => norm(w.name) === norm(sheetName));
    if (!ws) throw new BadRequestException(`Không tìm thấy sheet "${sheetName}"`);

    const { idxFull, idxEmail, idxPhone, idxPass, idxRole, idxCreatedAt } = getHeaderIndexes(ws);
    if (idxFull < 0 || idxEmail < 0) {
      throw new BadRequestException('Header cần: Full Name, Email, (Phone Number, Password, Role, CreatedAt tuỳ chọn)');
    }

    let batch: ParsedRow[] = [];

    // Start at 2 to skip header row
    const lastRow = ws.lastRow?.number ?? ws.rowCount;
    for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
      const row = ws.getRow(rowNumber);
      if (!row || row.cellCount === 0) continue;

      const fullName = cellText(row.getCell(idxFull));
      const emailRaw = cellText(row.getCell(idxEmail));
      if (!fullName || !emailRaw) continue;

      const phoneNumber = idxPhone > -1 ? cellText(row.getCell(idxPhone)) : undefined;
      const password = idxPass > -1 ? cellText(row.getCell(idxPass)) : undefined;
      const roleName = idxRole > -1 ? cellText(row.getCell(idxRole)) : undefined;

      const createdAt = idxCreatedAt > -1 ? parseDateCell(row.getCell(idxCreatedAt)) : undefined;

      if (DEBUG_EXCEL && rowNumber === 2) {
        console.dir(
          { _debugSample: { fullName, emailRaw, phoneNumber, password, roleName, createdAt } },
          { depth: null }
        );
      }

      batch.push({ fullName, emailRaw, phoneNumber, password, roleName, createdAt });

      if (batch.length >= batchSize) {
        yield batch;
        batch = [];
      }
    }

    if (batch.length) yield batch;
  }

  // ========================
  // Data Loading
  // ========================

  private async loadExamSetWithQuestions(examSetId: string) {
    const examSet = await this.prisma.examSet.findUnique({
      where: { id: examSetId },
      include: {
        framework: { select: { id: true } },
        setQuestion: {
          orderBy: { orderIndex: Order.ASC },
          include: {
            question: {
              include: {
                answerOptions: { orderBy: { orderIndex: Order.ASC } },
                skill: {
                  select: {
                    id: true,
                    aspectId: true,
                    aspect: { select: { id: true, pillarId: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!examSet) throw new BadRequestException(`Không tìm thấy ExamSet id=${examSetId}`);

    const questions = examSet.setQuestion.map((sq) => sq.question);
    const frameworkId = (examSet.framework?.id as string) ?? (examSet as any).frameworkId;
    return { examSet, questions, frameworkId } as const;
  }

  private async loadRoleMap() {
    const allRoles = await this.prisma.role.findMany({ select: { id: true, name: true } });
    return new Map(allRoles.map((r) => [norm(r.name), r]));
  }

  // ========================
  // Per-row processing (invoked with concurrency control)
  // ========================

  private async processOneRow(
    row: ParsedRow,
    ctx: {
      examSet: { id: string; assessmentType: AssessmentType };
      questions: any[];
      frameworkId: string | null | undefined;
      roleMap: Map<string, { id: string; name?: string }>;
      scoring?: 'auto' | 'none';
    }
  ): Promise<{ createdUsers: number; createdExams: number; log?: string }> {
    const email = sanitizeEmail(row.emailRaw);
    if (!email) return { createdUsers: 0, createdExams: 0, log: `SKIP bad email: "${row.emailRaw}"` };

    const normalizedPhone = normalizeVNPhone(row.phoneNumber);
    const phoneToSave = await this.resolvePhoneNumberConflict(email, normalizedPhone);
    if (phoneToSave === null) {
      return { createdUsers: 0, createdExams: 0, log: `SKIP phone conflict ${normalizedPhone} email=${email}` };
    }

    const existed = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    const user = await this.upsertUser(email, row.fullName, phoneToSave ?? undefined, row.password, row.createdAt);
    const createdUsers = existed ? 0 : 1;

    await this.ensureUserRole(user.id, row.roleName, ctx.roleMap);

    const existedExam = await this.prisma.exam.findFirst({
      where: { userId: user.id, examSetId: ctx.examSet.id },
      select: { id: true },
    });
    if (existedExam) {
      return { createdUsers, createdExams: 0, log: `SKIP exam: ${email}` };
    }

    await this.prisma.$transaction(async (tx) => {
      const exam = await this.createExam(tx, user.id, ctx.examSet.id, ctx.examSet.assessmentType);

      const { gradable, nonGradable } = this.splitQuestions(ctx.questions);
      const gen = await this.createAnswersAndAggregate(tx, user.id, exam.id, gradable, nonGradable, ctx.scoring);

      const overallFromAnswers = this.computeOverall(gen.totalAutoRaw, gen.totalMax);
      const realMinutes = Math.max(1, Math.ceil(gen.totalSeconds / 60));

      const { sfia, examLevelId } = await this.deriveSfiaAndExamLevel(tx, ctx.frameworkId, overallFromAnswers);

      await this.updateExam(
        tx,
        exam.id,
        overallFromAnswers,
        realMinutes,
        sfia,
        examLevelId,
        ctx.examSet.assessmentType
      );

      await this.refreshCompetencyAssessment(
        tx,
        user.id,
        ctx.frameworkId,
        exam.id,
        overallFromAnswers,
        sfia,
        ctx.examSet
      );

      await this.createSnapshots(tx, exam.id, gen.pillarAgg, gen.aspectAgg);
    });

    return { createdUsers, createdExams: 1, log: `OK: ${email}` };
  }

  // ========================
  // User & Role
  // ========================

  private async resolvePhoneNumberConflict(
    email: string,
    normalizedPhone?: string | null
  ): Promise<string | undefined | null> {
    // returns: string to store, undefined to clear, null to SKIP entirely per policy
    if (!normalizedPhone) return undefined;

    const holder = await this.prisma.user.findFirst({
      where: { phoneNumber: normalizedPhone },
      select: { email: true },
    });
    if (!holder || holder.email === email) return normalizedPhone; // free or owned by same user

    if (PHONE_CONFLICT_POLICY === 'skip') return null;
    if (PHONE_CONFLICT_POLICY === 'nullify') return undefined;
    // default: keep nothing
    return undefined;
  }

  private async upsertUser(
    email: string,
    fullName: string,
    phoneNumber: string | undefined,
    rawPassword?: string,
    createdAt?: Date
  ) {
    const passwordHash = await hashPassword(rawPassword || DEFAULT_PW);
    return this.prisma.user.upsert({
      where: { email },
      update: { fullName, phoneNumber, timezone: DEFAULT_TZ },
      create: {
        email,
        fullName,
        phoneNumber,
        password: passwordHash,
        provider: 'excel',
        status: true,
        timezone: DEFAULT_TZ,
        createdAt: createdAt ?? new Date(),
      },
      select: { id: true },
    });
  }

  private async ensureUserRole(
    userId: string,
    inputRoleName: string | undefined,
    roleMap: Map<string, { id: string }>
  ) {
    const roleName = mapRoleName(inputRoleName);
    const role = roleMap.get(norm(roleName)) || roleMap.get(norm(DEFAULT_ROLE_NAME));
    if (!role) throw new BadRequestException(`Role "${roleName}" không tồn tại`);

    await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  private async hasExistingExam(userId: string, examSetId: string) {
    const existedExam = await this.prisma.exam.findFirst({ where: { userId, examSetId }, select: { id: true } });
    return !!existedExam;
  }

  // ========================
  // Exam Creation Flow
  // ========================

  private async createExam(
    tx: Prisma.TransactionClient,
    userId: string,
    examSetId: string,
    assessmentType: AssessmentType
  ) {
    return tx.exam.create({
      data: {
        userId,
        examSetId,
        assessmentType,
        examStatus: ExamStatus.SUBMITTED,
        startedAt: new Date(Date.now() - 10 * 60 * 1000),
        finishedAt: new Date(),
        completionPercent: new Prisma.Decimal('1.00'),
      },
      select: { id: true },
    });
  }

  private splitQuestions(questions: any[]) {
    const gradable: GradableQuestion[] = [];
    const nonGradable: NonGradableQuestion[] = [];

    for (const q of questions) {
      const max = Number((q as any).maxPossibleScore ?? 1);
      const aspectId = q?.skill?.aspectId ?? null;
      const pillarId = q?.skill?.aspect?.pillarId ?? null;

      if (q.type === QuestionType.ESSAY) {
        nonGradable.push({ id: (q as any).id, type: q.type, pillarId, aspectId });
        continue;
      }

      const correct = q.answerOptions.filter((a: any) => a.isCorrect).map((a: any) => a.id);
      const wrong = q.answerOptions.filter((a: any) => !a.isCorrect).map((a: any) => a.id);

      const item: GradableQuestion = {
        id: (q as any).id,
        type: q.type,
        max: Math.max(1, max),
        correctIds: correct,
        wrongIds: wrong,
        pillarId,
        aspectId,
      };
      if (q.type === QuestionType.MULTIPLE_CHOICE) item.multiAllCorrectIds = [...correct];
      gradable.push(item);
    }

    return { gradable, nonGradable } as const;
  }

  private async createAnswersAndAggregate(
    tx: Prisma.TransactionClient,
    userId: string,
    examId: string,
    gradable: GradableQuestion[],
    nonGradable: NonGradableQuestion[],
    scoring: 'auto' | 'none' | undefined
  ) {
    const pillarAgg: Agg = new Map();
    const aspectAgg: Agg = new Map();

    let totalSeconds = 0;
    let totalAutoRaw = 0;

    const totalMax = gradable.reduce((s, g) => s + g.max, 0);

    // Choose target overall (2..4) only when auto scoring is enabled
    const targetOverall = scoring === 'none' ? SCORE_MIN : randomOverall();
    const desiredTotalRaw = (targetOverall / 10) * (totalMax > 0 ? totalMax : 1);

    let plan = new Map<string, boolean>();
    if (totalMax > 0 && scoring !== 'none') plan = buildScoringPlan(gradable, desiredTotalRaw);

    // Gradable questions
    for (const g of gradable) {
      const wantCorrect = scoring === 'none' ? false : (plan.get(g.id) ?? false);
      const selections = pickSelectionsForDecision(
        { type: g.type, correctIds: g.correctIds, wrongIds: g.wrongIds, multiAllCorrectIds: g.multiAllCorrectIds },
        wantCorrect
      );

      const spent = this.randomSpentSeconds();
      totalSeconds += spent;

      const raw = wantCorrect ? g.max : 0;
      totalAutoRaw += raw;

      this.accumulate(pillarAgg, g.pillarId, raw, g.max);
      this.accumulate(aspectAgg, g.aspectId, raw, g.max);

      await tx.userAnswer.create({
        data: {
          userId,
          examId,
          questionId: g.id,
          status: UserAnswerStatus.SUBMIT,
          rawScore: new Prisma.Decimal(raw),
          finalScore: new Prisma.Decimal(raw),
          scorePercentage: new Prisma.Decimal(wantCorrect ? 1 : 0), // 0..1
          timeSpentSeconds: spent,
          selections: selections.length
            ? { create: selections.map((answerOptionId) => ({ answerOptionId })) }
            : undefined,
        },
      });
    }

    // Non-gradable (ESSAY)
    for (const q of nonGradable) {
      const spent = this.randomSpentSeconds();
      totalSeconds += spent;
      await tx.userAnswer.create({
        data: {
          userId,
          examId,
          questionId: q.id,
          status: UserAnswerStatus.SUBMIT,
          rawScore: null,
          finalScore: null,
          scorePercentage: null,
          timeSpentSeconds: spent,
        },
      });
    }

    return { pillarAgg, aspectAgg, totalSeconds, totalAutoRaw, totalMax } as const;
  }

  private computeOverall(totalAutoRaw: number, totalMax: number): number {
    if (totalMax <= 0) return randomOverall();
    let calc = Math.round(((totalAutoRaw / totalMax) * 10 + Number.EPSILON) * 100) / 100;
    return Math.max(SCORE_MIN, Math.min(SCORE_MAX, calc));
  }

  private async deriveSfiaAndExamLevel(
    tx: Prisma.TransactionClient,
    frameworkId: string | null | undefined,
    overall: number
  ) {
    const sfia = getSFIALevel(overall ?? SCORE_MIN);
    const levelNumber = (sfia as string).split('_')[1];
    const matchedExamLevels = Object.values(ExamLevelEnum).filter((level) => level.startsWith(`LEVEL_${levelNumber}_`));

    const examLevel = await tx.examLevel.findFirst({
      where: { examLevel: { in: matchedExamLevels } },
      select: { id: true },
    });

    return { sfia: sfia as SFIALevel, examLevelId: examLevel?.id } as const;
  }

  private async updateExam(
    tx: Prisma.TransactionClient,
    examId: string,
    overall: number,
    timeSpentMinutes: number,
    sfia: SFIALevel,
    examLevelId: string | undefined,
    assessmentType: AssessmentType
  ) {
    await tx.exam.update({
      where: { id: examId },
      data: {
        overallScore: new Prisma.Decimal(overall ?? SCORE_MIN),
        finishedAt: new Date(),
        examStatus: ExamStatus.SUBMITTED,
        completionPercent: new Prisma.Decimal('1.00'),
        timeSpentMinutes,
        readyToWorkTier: ReadyToWorkTier.NOT_READY,
        sfiaLevel: sfia,
        examLevelId: examLevelId ?? undefined,
        assessmentType,
      },
    });
  }

  private async refreshCompetencyAssessment(
    tx: Prisma.TransactionClient,
    userId: string,
    frameworkId: string | null | undefined,
    examId: string,
    overall: number,
    sfia: SFIALevel,
    examSet: { assessmentType: AssessmentType }
  ) {
    await tx.competencyAssessment.updateMany({
      where: { userId, frameworkId, isCurrent: true },
      data: { isCurrent: false },
    });

    const mindset = jitter(overall ?? SCORE_MIN, 0.3);
    const skillset = jitter(overall ?? SCORE_MIN, 0.3);
    const toolset = jitter(overall ?? SCORE_MIN, 0.3);

    await tx.competencyAssessment.create({
      data: {
        userId,
        frameworkId: frameworkId ?? undefined,
        examId,
        assessorId: null,
        mindsetScore: new Prisma.Decimal(mindset),
        skillsetScore: new Prisma.Decimal(skillset),
        toolsetScore: new Prisma.Decimal(toolset),
        overallScore: new Prisma.Decimal(overall ?? SCORE_MIN),
        sfiaLevel: sfia,
        readyToWorkTier: ReadyToWorkTier.NOT_READY,
        assessmentType: examSet.assessmentType,
        isCurrent: true,
        certificationDate: null,
        expiryDate: null,
      },
    });
  }

  private async createSnapshots(tx: Prisma.TransactionClient, examId: string, pillarAgg: Agg, aspectAgg: Agg) {
    const pillarRows: { examId: string; pillarId: string; score: Prisma.Decimal }[] = [];
    pillarAgg.forEach((agg, pillarId) => {
      let score = agg.max > 0 ? agg.raw / agg.max : 0; // 0..1
      score = Math.round((score + Number.EPSILON) * 100) / 100;
      pillarRows.push({ examId, pillarId, score: new Prisma.Decimal(score) });
    });

    const aspectRows: { examId: string; aspectId: string; score: Prisma.Decimal }[] = [];
    aspectAgg.forEach((agg, aspectId) => {
      let score = agg.max > 0 ? agg.raw / agg.max : 0; // 0..1
      score = Math.round((score + Number.EPSILON) * 100) / 100;
      aspectRows.push({ examId, aspectId, score: new Prisma.Decimal(score) });
    });

    if (pillarRows.length) await tx.examPillarSnapshot.createMany({ data: pillarRows, skipDuplicates: true });
    if (aspectRows.length) await tx.examAspectSnapshot.createMany({ data: aspectRows, skipDuplicates: true });
  }

  // ========================
  // Small Utilities
  // ========================

  private randomSpentSeconds() {
    return Math.floor(Math.random() * 90) + 30;
  }

  private accumulate(map: Agg, key?: string | null, raw = 0, max = 0) {
    if (!key) return;
    const cur = map.get(key) ?? { raw: 0, max: 0 };
    cur.raw += raw;
    cur.max += max;
    map.set(key, cur);
  }
}
