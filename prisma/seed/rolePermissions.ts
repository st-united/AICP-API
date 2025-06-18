import { PrismaClient, Permission, Role } from '@prisma/client';

export async function seedRolePermissions(prisma: PrismaClient, roles: Role[], permissions: Permission[]) {
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r]));

  const assignRolePermission = async (roleName: string, slugs: string[]) => {
    for (const slug of slugs) {
      const perm = permissions.find((p) => p.slug === slug);
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: roleMap[roleName].id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: roleMap[roleName].id,
            permissionId: perm.id,
          },
        });
      }
    }
  };

  await assignRolePermission(
    'super admin',
    permissions.map((p) => p.slug)
  );
  await assignRolePermission('admin', [
    'dashboard:get',
    'users:manage',
    'roles:manage',
    'questions:create',
    'questions:edit',
    'questions:delete',
    'exams:get',
    'mentors:manage',
    'mentors/booking:post',
  ]);
  await assignRolePermission('company', ['companies:manage', 'dashboard:get', 'exams:get']);
  await assignRolePermission('user', ['dashboard:get', 'mentors/booking:post']);
  await assignRolePermission('mentor', ['dashboard:get']);
  await assignRolePermission('examiner', [
    'dashboard:get',
    'questions:create',
    'questions:edit',
    'questions:delete',
    'exams:create',
    'answers/evaluate:post',
    'exams:get',
  ]);
}
