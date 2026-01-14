import { AssessmentMethod, CompetencyAspect, PrismaClient } from '@prisma/client';
import { AssessmentMethodSeedEnum } from './constant/assessmentMethodSeedEnum';

export async function seedCompetencyAspectAssessmentMethod(
  prisma: PrismaClient,
  aspects: CompetencyAspect[],
  assessmentMethods: AssessmentMethod[]
) {
  try {
    // Mapping assessment methods với represent codes của aspects
    const mappings: Record<string, string[]> = {
      [AssessmentMethodSeedEnum.TEST_ONLINE]: ['A1', 'A3', 'A4', 'A5', 'B1', 'B2', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3'],
      [AssessmentMethodSeedEnum.EVIDENCE]: [
        'A1',
        'A2',
        'A3',
        'B1',
        'B2',
        'B3',
        'B4',
        'B5',
        'B6',
        'C1',
        'C2',
        'C3',
        'C4',
      ],
      [AssessmentMethodSeedEnum.INTERVIEW]: [], // Tất cả aspects
    };

    for (const assessmentMethod of assessmentMethods) {
      const representCodes = mappings[assessmentMethod.name];

      // Nếu không có mapping, bỏ qua
      if (representCodes === undefined) {
        console.warn(`No mapping found for assessment method: ${assessmentMethod.name}`);
        continue;
      }

      let selectedAspects: CompetencyAspect[];

      // Interview: lấy tất cả aspects
      if (assessmentMethod.name === AssessmentMethodSeedEnum.INTERVIEW) {
        selectedAspects = aspects;
      } else {
        // Test Online, Evidence: lọc theo represent code
        selectedAspects = aspects.filter((aspect) => representCodes.includes(aspect.represent));
      }

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
