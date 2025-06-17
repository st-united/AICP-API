import { PrismaClient, Question, CompetencyFramework } from '@prisma/client';

export async function seedExamSets(
  prisma: PrismaClient,
  questions: Question[],
  competencyFrameworks: CompetencyFramework[]
) {
  const competencyFrameworkMap = Object.fromEntries(competencyFrameworks.map((c) => [c.version, c]));

  const examSetsData = [
    {
      name: 'AI Foundations Assessment',
      description: 'Basic assessment of foundational AI knowledge',
      questions: [0, 1],
      frameworkVersion: '5.0',
    },
    {
      name: 'AI Ethics and Impact',
      description: 'Assessment focusing on ethical considerations and societal impacts of AI',
      questions: [0],
      frameworkVersion: '5.0',
    },
    {
      name: 'AI Tools and Applications',
      description: 'Assessment of practical AI tools and applications knowledge',
      questions: [1],
      frameworkVersion: '5.0',
    },
    {
      name: 'AI INPUT TEST',
      description:
        'Bài kiểm tra đánh giá đầu vào cho các bạn đã có kiến thức về AI, là developer và muốn nâng cao kiến thức về AI',
      questions: [0, 1],
      frameworkVersion: '5.0',
    },
  ];

  const examSets = await Promise.all(
    examSetsData.map(async (examSetData) => {
      const examSet = await prisma.examSet.create({
        data: {
          name: examSetData.name,
          description: examSetData.description,
          timeLimitMinutes: 40,
          frameworkId: competencyFrameworkMap[examSetData.frameworkVersion].id,
        },
      });

      const examSetQuestions = examSetData.questions.map((questionIndex, i) => ({
        examSetId: examSet.id,
        questionId: questions[questionIndex].id,
        orderIndex: i + 1,
      }));

      await prisma.examSetQuestion.createMany({
        data: examSetQuestions,
      });

      return examSet;
    })
  );
}
