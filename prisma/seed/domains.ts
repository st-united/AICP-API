import { PrismaClient } from '@prisma/client';

export async function seedDomains(prisma: PrismaClient) {
  const domainsData = [
    {
      name: 'Y tế',
      description: 'Ứng dụng AI trong chăm sóc sức khỏe và y học',
    },
    {
      name: 'Tài chính',
      description: 'Ứng dụng AI trong dịch vụ tài chính và công nghệ tài chính',
    },
    {
      name: 'Giáo dục',
      description: 'Ứng dụng AI trong giáo dục và học tập',
    },
    {
      name: 'Công nghệ thông tin',
      description: 'Ứng dụng AI trong công nghệ thông tin và sản xuất',
    },
    {
      name: 'Đa lĩnh vực',
      description: 'Kiến thức AI tổng quát áp dụng cho nhiều lĩnh vực',
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
