import { PrismaClient, ExamSet, SFIALevel, ReadyToWorkTier } from '@prisma/client';

export async function seedExams(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
  examSets: ExamSet[]
) {
  const examSetMap = Object.fromEntries(examSets.map((es) => [es.name, es]));

  const examData = [
    {
      email: 'user1@example.com',
      emailMentor: 'mentor1@example.com',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      mindsetScore: 1.5,
      skillsetScore: 2,
      toolsetScore: 1.5,
      overallScore: 5,
    },
    {
      email: 'user2@example.com',
      emailMentor: 'mentor2@example.com',
      examSetName: 'AI Ethics and Impact',
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      mindsetScore: 1.5,
      skillsetScore: 2,
      toolsetScore: 1.5,
      overallScore: 5,
    },
    {
      email: 'user2@example.com',
      emailMentor: 'mentor2@example.com',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      mindsetScore: 1.5,
      skillsetScore: 2,
      toolsetScore: 1.5,
      overallScore: 5,
    },
    {
      email: 'user@example.com',
      emailMentor: 'mentor3@example.com',
      examSetName: 'AI INPUT TEST',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      mindsetScore: 1.5,
      skillsetScore: 2,
      toolsetScore: 3,
      overallScore: 6.5,
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
        mindsetScore: data.mindsetScore,
        skillsetScore: data.skillsetScore,
        toolsetScore: data.toolsetScore,
        overallScore: data.overallScore,
        timeSpentMinutes: Math.floor((data.finishedAt.getTime() - data.startedAt.getTime()) / 1000 / 60),
        completionPercent: 1,
        readyToWorkTier: ReadyToWorkTier.NOT_READY,
        sfiaLevel: sfiaLevels[Math.floor(Math.random() * sfiaLevels.length)],
      },
    })
  );

  const exams = await Promise.all(examPromises);

  return Object.fromEntries(
    examData.map((data, index) => [`${data.email}-${data.examSetName}`, { id: exams[index].id }])
  );
}
