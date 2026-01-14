import { AssessmentMethod, CompetencyAspect, PrismaClient } from '@prisma/client';

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function seedCompetencyAspectAssessmentMethod(
  prisma: PrismaClient,
  aspects: CompetencyAspect[],
  assessmentMethods: AssessmentMethod[]
) {
  try {
    for (const assessmentMethod of assessmentMethods) {
      // Random số lượng aspects từ 1 đến toàn bộ
      const randomCount = Math.floor(Math.random() * aspects.length) + 1;

      // Shuffle và chọn random aspects
      const shuffledAspects = shuffleArray(aspects);
      const selectedAspects = shuffledAspects.slice(0, randomCount);

      for (const aspect of selectedAspects) {
        const existingMapping = await prisma.competencyAspectAssessmentMethod.findUnique({
          where: {
            competencyAspectId_assessmentMethodId: {
              competencyAspectId: aspect.id,
              assessmentMethodId: assessmentMethod.id,
            },
          },
        });

        if (!existingMapping) {
          await prisma.competencyAspectAssessmentMethod.create({
            data: {
              competencyAspectId: aspect.id,
              assessmentMethodId: assessmentMethod.id,
              weightWithinDimension: 1.0,
            },
          });
        }
      }
    }

    console.log('✅ Seeded CompetencyAspectAssessmentMethod successfully');
  } catch (error) {
    console.error('❌ Error seeding CompetencyAspectAssessmentMethod:', error);
    throw error;
  }
}
