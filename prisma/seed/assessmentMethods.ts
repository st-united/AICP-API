import { convertStringToEnglish } from '../../src/common/utils/stringUtils';
import { PrismaClient } from '@prisma/client';

export async function seedAssessmentMethods(prisma: PrismaClient) {
  const assessmentMethods = [
    {
      name: 'Self Assessment',
      description: 'Individual self-evaluation of competencies and skills',
      isActive: true,
    },
    {
      name: 'Peer Review',
      description: 'Evaluation by colleagues or peers',
      isActive: true,
    },
    {
      name: 'Manager Review',
      description: 'Evaluation by direct manager or supervisor',
      isActive: true,
    },
    {
      name: 'Practical Skills Test',
      description: 'Hands-on assessment of practical abilities',
      isActive: true,
    },
    {
      name: 'Portfolio Review',
      description: 'Assessment based on portfolio of work and evidence',
      isActive: true,
    },
    {
      name: 'Comprehensive Assessment',
      description: 'Comprehensive evaluation combining multiple methods',
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
