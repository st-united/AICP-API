import { PrismaClient, Question } from '@prisma/client';

export async function seedUserAnswers(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
  questions: Question[],
  examMap: { [key: string]: { id: string } }
) {
  const sampleUserAnswers = [
    {
      email: 'user1@example.com',
      questionIndex: 0,
      answerText: 'Các hệ thống AI có khả năng tạo ra nội dung mới như văn bản, hình ảnh, âm thanh',
      manualScore: null,
      autoScore: 10,
      answerOptionIndex: 1,
      examSetName: 'AI Foundations Assessment',
    },
    {
      email: 'user2@example.com',
      questionIndex: 1,
      answerText: 'Transformer Architecture',
      manualScore: null,
      autoScore: 10,
      answerOptionIndex: 2,
      examSetName: 'AI Ethics and Impact',
    },
  ];

  for (const answerData of sampleUserAnswers) {
    const exam = examMap[`${answerData.email}-${answerData.examSetName}`];
    const userAnswer = await prisma.userAnswer.create({
      data: {
        userId: userMap[answerData.email].id,
        questionId: questions[answerData.questionIndex].id,
        answerText: answerData.answerText,
        manualScore: answerData.manualScore,
        autoScore: answerData.autoScore,
        examId: exam.id,
      },
    });

    if (answerData.answerOptionIndex !== null) {
      const answerOptions = await prisma.answerOption.findMany({
        where: {
          questionId: questions[answerData.questionIndex].id,
        },
      });

      await prisma.userAnswerSelection.create({
        data: {
          userAnswerId: userAnswer.id,
          answerOptionId: answerOptions[answerData.answerOptionIndex].id,
        },
      });
    }
  }
}
