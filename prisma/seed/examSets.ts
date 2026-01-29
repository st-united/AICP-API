import { PrismaClient, Question, CompetencyFramework, AssessmentMethod } from '@prisma/client';
import { AssessmentMethodSeedEnum } from './constant/assessmentMethodSeedEnum';

export async function seedExamSets(
  prisma: PrismaClient,
  questions: Question[],
  competencyFrameworks: CompetencyFramework[]
) {
  const competencyFrameworkMap = Object.fromEntries(competencyFrameworks.map((c) => [c.version, c]));

  const examSetsData = [
    {
      name: 'AI Foundations Assessment',
      urlImage:
        'https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      description: 'Basic assessment of foundational AI knowledge',
      questions: [0, 1],
      frameworkVersion: '5.0',
    },
    {
      name: 'AI Ethics and Impact',
      urlImage:
        'https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      description: 'Assessment focusing on ethical considerations and societal impacts of AI',
      questions: [0],
      frameworkVersion: '5.0',
    },
    {
      name: 'AI Tools and Applications',
      urlImage:
        'https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      description: 'Assessment of practical AI tools and applications knowledge',
      questions: [1],
      frameworkVersion: '5.0',
    },
    {
      name: 'AI For Fresher',
      urlImage:
        'https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      description:
        'Bài kiểm tra đánh giá đầu vào cho các bạn đã có kiến thức về AI, là developer và muốn nâng cao kiến thức về AI',
      questions: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34,
        // 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      ],
      frameworkVersion: '5.0',
    },
    {
      name: 'AI For Fresher (Non-IT)',
      urlImage:
        'https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      description:
        'Bài kiểm tra đánh giá đầu vào cho các bạn đã có kiến thức về AI, là developer và muốn nâng cao kiến thức về AI',
      questions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      frameworkVersion: '5.0',
    },
  ];

  await Promise.all(
    examSetsData.map(async (examSetData) => {
      const examSet = await prisma.examSet.create({
        data: {
          name: examSetData.name,
          description: examSetData.description,
          urlImage: examSetData.urlImage,
          startDate: examSetData.startDate,
          endDate: examSetData.endDate,
          timeLimitMinutes: 15,
          passingScore: 3,
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
    })
  );
}
