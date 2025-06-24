import { PrismaClient } from '@prisma/client';

export async function seedPermissions(prisma: PrismaClient) {
  const permissionsData = [
    { name: 'View Dashboard', slug: 'dashboard:get', description: 'Can view dashboard' },
    { name: 'Manage Users', slug: 'users:manage', description: 'Can manage users' },
    { name: 'Manage Roles', slug: 'roles:manage', description: 'Can manage roles' },
    { name: 'Manage Companies', slug: 'companies:manage', description: 'Can manage companies' },
    { name: 'Create Questions', slug: 'questions:create', description: 'Can create questions' },
    { name: 'Edit Questions', slug: 'questions:edit', description: 'Can edit questions' },
    { name: 'Delete Questions', slug: 'questions:delete', description: 'Can delete questions' },
    { name: 'View Exams', slug: 'exams:get', description: 'Can view exams' },
    { name: 'Create Exams', slug: 'exams:create', description: 'Can create exams' },
    { name: 'Evaluate Answers', slug: 'answers/evaluate:post', description: 'Can evaluate user answers' },
    { name: 'Manage Mentors', slug: 'mentors:manage', description: 'Can manage mentors' },
    { name: 'Book Mentors', slug: 'mentors/booking:post', description: 'Can booking mentors' },
  ];

  await prisma.permission.createMany({
    data: permissionsData,
    skipDuplicates: false,
  });
}
