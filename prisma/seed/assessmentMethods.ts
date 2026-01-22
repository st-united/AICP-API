import { convertStringToEnglish } from '@app/common/utils';
import { PrismaClient } from '@prisma/client';
import { AssessmentMethodSeedEnum } from './constant/assessmentMethodSeedEnum';

export async function seedAssessmentMethods(prisma: PrismaClient) {
  const assessmentMethods = [
    {
      name: AssessmentMethodSeedEnum.TEST_ONLINE,
      description: 'Online test to assess individual competencies and skills',
      isActive: true,
    },
    {
      name: AssessmentMethodSeedEnum.EVIDENCE,
      description: 'Assessment based on submitted evidence such as work samples, certificates, or portfolios',
      isActive: true,
    },
    {
      name: AssessmentMethodSeedEnum.INTERVIEW,
      description: 'Competency assessment conducted through a structured interview with an expert or evaluator',
      isActive: true,
    },
  ];

  for (const method of assessmentMethods) {
    const existingMethod = await prisma.assessmentMethod.findUnique({
      where: {
        name: method.name,
      },
    });

    if (!existingMethod) {
      const searchText = convertStringToEnglish(method.name, true);
      await prisma.assessmentMethod.create({
        data: {
          name: method.name,
          searchText: searchText,
          description: method.description,
          isActive: method.isActive,
        },
      });
      console.log(`✅ Created assessment method: ${method.name}`);
    } else {
      console.log(`⏭️  Assessment method already exists: ${method.name}`);
    }
  }
}
