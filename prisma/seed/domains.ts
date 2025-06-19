import { PrismaClient } from '@prisma/client';

export async function seedDomains(prisma: PrismaClient) {
  const domainsData = [
    {
      name: 'Healthcare',
      description: 'AI applications in healthcare and medicine',
    },
    {
      name: 'Finance',
      description: 'AI applications in financial services and fintech',
    },
    {
      name: 'Education',
      description: 'AI applications in education and learning',
    },
    {
      name: 'Information Technology',
      description: 'AI applications in Information Technology and production',
    },
    {
      name: 'General',
      description: 'General AI knowledge applicable across domains',
    },
  ];

  for (const domainData of domainsData) {
    await prisma.domain.upsert({
      where: { name: domainData.name },
      update: {},
      create: domainData,
    });
  }
}
