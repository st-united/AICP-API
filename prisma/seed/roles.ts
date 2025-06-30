import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  const rolesData = [
    { name: 'super admin', description: 'Super administrator of system' },
    { name: 'admin', description: 'Administrator' },
    { name: 'company', description: 'Company owner/manager' },
    { name: 'user', description: 'Regular user' },
    { name: 'mentor', description: 'Mentor or coach' },
    { name: 'examiner', description: 'Can create and evaluate exams' },
  ];

  await prisma.role.createMany({
    data: rolesData,
    skipDuplicates: false,
  });
}
