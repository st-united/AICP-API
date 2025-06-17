import { PrismaClient, Domain } from '@prisma/client';

export async function seedCompetencyFrameworks(prisma: PrismaClient, domains: Domain[]) {
  const domainMap = Object.fromEntries(domains.map((d) => [d.name, d]));

  const competencyFrameworkName = [
    {
      domainName: 'Healthcare',
      name: 'Healthcare',
      version: '1.0',
    },
    {
      domainName: 'Finance',
      name: 'Finance',
      version: '2.0',
    },
    {
      domainName: 'Education',
      name: 'Education',
      version: '3.0',
    },
    {
      domainName: 'Information Technology',
      name: 'Information Technology',
      version: '4.0',
    },
    {
      domainName: 'General',
      name: 'General',
      version: '5.0',
    },
  ];

  await prisma.competencyFramework.createMany({
    data: competencyFrameworkName.map((framework) => ({
      version: framework.version,
      name: framework.name,
      domainId: domainMap[framework.domainName].id,
    })),
    skipDuplicates: false,
  });
}
