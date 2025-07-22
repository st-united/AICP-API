import { PrismaClient, Domain } from '@prisma/client';

export async function seedCompetencyFrameworks(prisma: PrismaClient, domains: Domain[]) {
  const domainMap = Object.fromEntries(domains.map((d) => [d.name, d]));

  const competencyFrameworkName = [
    {
      domainName: 'Y tế',
      name: 'Y tế',
      version: '1.0',
    },
    {
      domainName: 'Tài chính',
      name: 'Tài chính',
      version: '2.0',
    },
    {
      domainName: 'Giáo dục',
      name: 'Giáo dục',
      version: '3.0',
    },
    {
      domainName: 'Công nghệ thông tin',
      name: 'Công nghệ thông tin',
      version: '4.0',
    },
    {
      domainName: 'Đa lĩnh vực',
      name: 'Đa lĩnh vực',
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
