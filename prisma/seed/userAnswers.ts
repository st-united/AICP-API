import { PrismaClient, Question, UserAnswerStatus } from '@prisma/client';

export async function seedUserAnswers(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
  questions: Question[],
  examMap: { [key: string]: { id: string } }
) {
  const userEmail = 'user@example.com';
  const examSetName = 'AI For Fresher';

  const answerOptions = await prisma.answerOption.findMany({
    where: {
      questionId: { in: questions.map((q) => q.id) },
    },
  });

  const userAnswersData = questions.map((question, index) => {
    const questionAnswerOptions = answerOptions.filter((ao) => ao.questionId === question.id);
    const correctOptions = questionAnswerOptions.filter((ao) => ao.isCorrect);
    const selectedOption = correctOptions.length > 0 ? correctOptions[0] : questionAnswerOptions[0];

    return {
      email: userEmail,
      questionIndex: index,
      answerText: selectedOption ? selectedOption.content : 'Sample answer for open-ended question',
      answerOptionIndex: selectedOption ? questionAnswerOptions.findIndex((ao) => ao.id === selectedOption.id) : null,
      examSetName,
    };
  });

  for (const answerData of userAnswersData) {
    const exam = examMap[`${answerData.email}-${answerData.examSetName}`];
    const userAnswer = await prisma.userAnswer.create({
      data: {
        userId: userMap[answerData.email].id,
        questionId: questions[answerData.questionIndex].id,
        answerText: answerData.answerText,
        examId: exam.id,
        timeSpentSeconds: Math.floor(Math.random() * 60) + 30,
        attemptCount: 1,
        confidenceLevel: Math.floor(Math.random() * 7) + 1,
        status: UserAnswerStatus.SUBMIT,
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
