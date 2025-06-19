import { PrismaClient, ExamSet } from '@prisma/client';

export async function seedExams(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
  examSets: ExamSet[]
) {
  const examSetMap = Object.fromEntries(examSets.map((es) => [es.name, es]));

  const examData = [
    {
      email: 'user1@example.com',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      totalScore: 75.5,
    },
    {
      email: 'user2@example.com',
      examSetName: 'AI Ethics and Impact',
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      totalScore: 82.0,
    },
    {
      email: 'user2@example.com',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      totalScore: 75.5,
    },
    {
      email: 'user@example.com',
      examSetName: 'AI INPUT TEST',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      totalScore: 68.5,
    },
  ];

  const examPromises = examData.map((data) =>
    prisma.exam.create({
      data: {
        userId: userMap[data.email].id,
        examSetId: examSetMap[data.examSetName].id,
        startedAt: data.startedAt,
        finishedAt: data.finishedAt,
      },
    })
  );

  const exams = await Promise.all(examPromises);

  return Object.fromEntries(
    examData.map((data, index) => [`${data.email}-${data.examSetName}`, { id: exams[index].id }])
  );
}
