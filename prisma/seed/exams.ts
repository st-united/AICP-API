import {
  PrismaClient,
  ExamSet,
  SFIALevel,
  ReadyToWorkTier,
  CompetencyPillar,
  CompetencyAspect,
  CompetencyDimension,
  ExamLevel,
} from '@prisma/client';

export async function seedExams(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
  examSets: ExamSet[],
  examLevels: ExamLevel[]
) {
  const examSetMap = Object.fromEntries(examSets.map((es) => [es.name, es]));

  const examLevelMap = Object.fromEntries(examLevels.map((es) => [es.examLevel, es]));

  const examData = [
    {
      email: 'user1@example.com',
      emailMentor: 'mentor1@example.com',
      examLevelName: 'LEVEL_5_STRATEGIST',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      overallScore: 5,
      // Định nghĩa điểm số cho từng aspect theo dimension
      aspectScores: {
        [CompetencyDimension.MINDSET]: {
          'Khả Năng Thích Ứng & Tư Duy Phát Triển': 1.8,
          'Tự Học & Cải Tiến Liên Tục': 1.6,
          'Tư Duy Phản Biện & Lý Luận Đạo Đức': 1.4,
          'Trí Tuệ Ranh Giới Con Người-AI': 1.3,
          'Nhận Thức Rủi Ro & Quản Trị AI': 1.5,
        },
        [CompetencyDimension.SKILLSET]: {
          'Giao Tiếp AI & Prompt Engineering': 2.2,
          'Nghiên Cứu & Tổng Hợp Thông Tin': 2.0,
          'Làm Việc Nhóm & Hợp Tác AI-Con Người': 1.8,
          'Hiểu Biết Dữ Liệu & Xác Thực': 2.1,
          'Phân Tách Vấn Đề & Xác Định Phạm Vi AI': 1.9,
          'Năng Lực Bảo Mật & Quyền Riêng Tư': 2.0,
        },
        [CompetencyDimension.TOOLSET]: {
          'Thành Thạo Công Cụ AI Cốt Lõi': 1.6,
          'Đánh Giá & Lựa Chọn Công Cụ': 1.4,
          'Tích Hợp & Thiết Kế Quy Trình': 1.5,
          'Đổi Mới & Phát Triển Tùy Chỉnh': 1.3,
        },
      },
    },
    {
      email: 'user2@example.com',
      emailMentor: 'mentor2@example.com',
      examLevelName: 'LEVEL_5_STRATEGIST',
      examSetName: 'AI Ethics and Impact',
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      overallScore: 5,
      aspectScores: {
        [CompetencyDimension.MINDSET]: {
          'Khả Năng Thích Ứng & Tư Duy Phát Triển': 1.7,
          'Tự Học & Cải Tiến Liên Tục': 1.8,
          'Tư Duy Phản Biện & Lý Luận Đạo Đức': 2.0,
          'Trí Tuệ Ranh Giới Con Người-AI': 1.6,
          'Nhận Thức Rủi Ro & Quản Trị AI': 2.1,
        },
        [CompetencyDimension.SKILLSET]: {
          'Giao Tiếp AI & Prompt Engineering': 1.9,
          'Nghiên Cứu & Tổng Hợp Thông Tin': 2.2,
          'Làm Việc Nhóm & Hợp Tác AI-Con Người': 2.0,
          'Hiểu Biết Dữ Liệu & Xác Thực': 1.8,
          'Phân Tách Vấn Đề & Xác Định Phạm Vi AI': 2.1,
          'Năng Lực Bảo Mật & Quyền Riêng Tư': 2.2,
        },
        [CompetencyDimension.TOOLSET]: {
          'Thành Thạo Công Cụ AI Cốt Lõi': 1.5,
          'Đánh Giá & Lựa Chọn Công Cụ': 1.6,
          'Tích Hợp & Thiết Kế Quy Trình': 1.4,
          'Đổi Mới & Phát Triển Tùy Chỉnh': 1.7,
        },
      },
    },
    {
      email: 'user2@example.com',
      emailMentor: 'mentor2@example.com',
      examLevelName: 'LEVEL_5_STRATEGIST',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      overallScore: 5,
      aspectScores: {
        [CompetencyDimension.MINDSET]: {
          'Khả Năng Thích Ứng & Tư Duy Phát Triển': 2.0,
          'Tự Học & Cải Tiến Liên Tục': 1.9,
          'Tư Duy Phản Biện & Lý Luận Đạo Đức': 1.7,
          'Trí Tuệ Ranh Giới Con Người-AI': 1.8,
          'Nhận Thức Rủi Ro & Quản Trị AI': 1.6,
        },
        [CompetencyDimension.SKILLSET]: {
          'Giao Tiếp AI & Prompt Engineering': 2.1,
          'Nghiên Cứu & Tổng Hợp Thông Tin': 1.9,
          'Làm Việc Nhóm & Hợp Tác AI-Con Người': 2.2,
          'Hiểu Biết Dữ Liệu & Xác Thực': 2.0,
          'Phân Tách Vấn Đề & Xác Định Phạm Vi AI': 1.8,
          'Năng Lực Bảo Mật & Quyền Riêng Tư': 2.1,
        },
        [CompetencyDimension.TOOLSET]: {
          'Thành Thạo Công Cụ AI Cốt Lõi': 1.7,
          'Đánh Giá & Lựa Chọn Công Cụ': 1.8,
          'Tích Hợp & Thiết Kế Quy Trình': 1.6,
          'Đổi Mới & Phát Triển Tùy Chỉnh': 1.9,
        },
      },
    },
    {
      email: 'user@example.com',
      emailMentor: 'mentor3@example.com',
      examLevelName: 'LEVEL_6_LEADER',
      examSetName: 'AI For Fresher',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      overallScore: 6.5,
      aspectScores: {
        [CompetencyDimension.MINDSET]: {
          'Khả Năng Thích Ứng & Tư Duy Phát Triển': 2.2,
          'Tự Học & Cải Tiến Liên Tục': 2.4,
          'Tư Duy Phản Biện & Lý Luận Đạo Đức': 2.1,
          'Trí Tuệ Ranh Giới Con Người-AI': 2.0,
          'Nhận Thức Rủi Ro & Quản Trị AI': 2.3,
        },
        [CompetencyDimension.SKILLSET]: {
          'Giao Tiếp AI & Prompt Engineering': 2.8,
          'Nghiên Cứu & Tổng Hợp Thông Tin': 2.6,
          'Làm Việc Nhóm & Hợp Tác AI-Con Người': 2.4,
          'Hiểu Biết Dữ Liệu & Xác Thực': 2.7,
          'Phân Tách Vấn Đề & Xác Định Phạm Vi AI': 2.5,
          'Năng Lực Bảo Mật & Quyền Riêng Tư': 2.3,
        },
        [CompetencyDimension.TOOLSET]: {
          'Thành Thạo Công Cụ AI Cốt Lõi': 3.2,
          'Đánh Giá & Lựa Chọn Công Cụ': 2.9,
          'Tích Hợp & Thiết Kế Quy Trình': 3.1,
          'Đổi Mới & Phát Triển Tùy Chỉnh': 2.8,
        },
      },
    },
  ];
  const sfiaLevels = [
    SFIALevel.LEVEL_1_AWARENESS,
    SFIALevel.LEVEL_2_FOUNDATION,
    SFIALevel.LEVEL_3_APPLICATION,
    SFIALevel.LEVEL_4_INTEGRATION,
    SFIALevel.LEVEL_5_INNOVATION,
    SFIALevel.LEVEL_6_LEADERSHIP,
    SFIALevel.LEVEL_7_MASTERY,
  ];

  const examPromises = examData.map((data) =>
    prisma.exam.create({
      data: {
        userId: userMap[data.email].id,
        reviewerId: userMap[data.emailMentor].id,
        examSetId: examSetMap[data.examSetName].id,
        startedAt: data.startedAt,
        finishedAt: data.finishedAt,
        overallScore: data.overallScore,
        timeSpentMinutes: Math.floor((data.finishedAt.getTime() - data.startedAt.getTime()) / 1000 / 60),
        completionPercent: 1,
        examLevelId: examLevelMap[data.examLevelName].id,
        readyToWorkTier: ReadyToWorkTier.NOT_READY,
        sfiaLevel: sfiaLevels[Math.floor(Math.random() * sfiaLevels.length)],
        assessmentMethodId: examSetMap[data.examSetName].assessmentMethodId,
      },
    })
  );

  const exams = await Promise.all(examPromises);

  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i];
    const data = examData[i];

    // Get pillars for this framework through PillarFramework junction table
    const pillarFrameworks = await prisma.pillarFramework.findMany({
      where: { frameworkId: examSetMap[data.examSetName].frameworkId },
      include: { pillar: true },
    });

    // Tạo ExamAspectSnapshot trước
    const aspectSnapshots: { pillarId: string; totalScore: number; aspectCount: number }[] = [];

    for (const pf of pillarFrameworks) {
      const pillar = pf.pillar;

      // Get aspects for this pillar through AspectPillar junction table
      const aspectPillars = await prisma.aspectPillar.findMany({
        where: { pillarId: pillar.id },
        include: { aspect: true },
      });

      let totalWeightedScore = 0;
      let totalWeight = 0;
      let aspectCount = 0;

      const aspectPromises = aspectPillars.map(async (ap) => {
        const aspect = ap.aspect;
        // Lấy điểm số từ data hoặc tạo random
        const aspectScoresForDimension = data.aspectScores[pillar.dimension] || {};
        const score = aspectScoresForDimension[aspect.name] ?? Math.random() * 2 + 1; // Random 1-3 nếu không có

        // Tính tổng trọng số cho pillar - lấy từ junction table
        const weight = Number(ap.weightWithinDimension);
        totalWeightedScore += score * weight;
        totalWeight += weight;
        aspectCount++;

        return prisma.examAspectSnapshot.create({
          data: {
            examId: exam.id,
            aspectId: aspect.id,
            score,
          },
        });
      });

      await Promise.all(aspectPromises);

      // Tính điểm trung bình có trọng số cho pillar
      const pillarScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      aspectSnapshots.push({
        pillarId: pillar.id,
        totalScore: pillarScore,
        aspectCount,
      });
    }

    // Tạo ExamPillarSnapshot dựa trên điểm tính được từ aspects
    const pillarSnapshotPromises = aspectSnapshots.map((snapshot) =>
      prisma.examPillarSnapshot.create({
        data: {
          examId: exam.id,
          pillarId: snapshot.pillarId,
          score: snapshot.totalScore,
        },
      })
    );

    await Promise.all(pillarSnapshotPromises);
  }

  return Object.fromEntries(
    examData.map((data, index) => [`${data.email}-${data.examSetName}`, { id: exams[index].id }])
  );
}
