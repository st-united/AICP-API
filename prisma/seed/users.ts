import { PrismaClient, Role, Domain } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function seedUsers(prisma: PrismaClient, roles: Role[]): Promise<{ [email: string]: { id: string } }> {
  const usersData = [
    {
      phoneNumber: '0901234567',
      email: 'superadmin@example.com',
      fullName: 'Super Admin',
      password: 'SuperAdmin123',
      role: 'super admin',
    },
    {
      phoneNumber: '0912345678',
      email: 'admin@example.com',
      fullName: 'Admin User',
      password: 'Admin123',
      role: 'admin',
    },
    {
      phoneNumber: '0923456789',
      email: 'company@example.com',
      fullName: 'Company Manager',
      password: 'Company123',
      role: 'company',
    },
    {
      phoneNumber: '0934567890',
      email: 'user@example.com',
      fullName: 'Regular User',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0945678901',
      email: 'mentor1@example.com',
      fullName: 'John Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678902',
      email: 'mentor2@example.com',
      fullName: 'Jane Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678903',
      email: 'mentor3@example.com',
      fullName: 'Mike Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678904',
      email: 'mentor4@example.com',
      fullName: 'Sarah Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678905',
      email: 'mentor5@example.com',
      fullName: 'David Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678906',
      email: 'mentor6@example.com',
      fullName: 'Lisa Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678907',
      email: 'mentor7@example.com',
      fullName: 'Tom Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678908',
      email: 'mentor8@example.com',
      fullName: 'Emma Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678909',
      email: 'mentor9@example.com',
      fullName: 'Chris Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678910',
      email: 'mentor10@example.com',
      fullName: 'Amy Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678911',
      email: 'mentor11@example.com',
      fullName: 'Peter Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678912',
      email: 'mentor12@example.com',
      fullName: 'Mary Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678913',
      email: 'mentor13@example.com',
      fullName: 'James Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678914',
      email: 'mentor14@example.com',
      fullName: 'Sophie Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678915',
      email: 'mentor15@example.com',
      fullName: 'Daniel Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678916',
      email: 'mentor16@example.com',
      fullName: 'Rachel Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678917',
      email: 'mentor17@example.com',
      fullName: 'Mark Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678918',
      email: 'mentor18@example.com',
      fullName: 'Laura Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678919',
      email: 'mentor19@example.com',
      fullName: 'Paul Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0945678920',
      email: 'mentor20@example.com',
      fullName: 'Julia Mentor',
      password: 'Mentor123',
      role: 'mentor',
    },
    {
      phoneNumber: '0956789012',
      email: 'examiner@example.com',
      fullName: 'Eva Examiner',
      password: 'Examiner123',
      role: 'examiner',
    },
    {
      phoneNumber: '0967890123',
      email: 'user1@example.com',
      fullName: 'User One',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901234',
      email: 'user2@example.com',
      fullName: 'User Two',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901235',
      email: 'user3@example.com',
      fullName: 'User Three',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901236',
      email: 'user4@example.com',
      fullName: 'User Four',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901237',
      email: 'user5@example.com',
      fullName: 'User Five',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901238',
      email: 'user6@example.com',
      fullName: 'User Six',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901239',
      email: 'user7@example.com',
      fullName: 'User Seven',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901240',
      email: 'user8@example.com',
      fullName: 'User Eight',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901241',
      email: 'user9@example.com',
      fullName: 'User Nine',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901242',
      email: 'user10@example.com',
      fullName: 'User Ten',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901243',
      email: 'user11@example.com',
      fullName: 'User Eleven',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901244',
      email: 'user12@example.com',
      fullName: 'User Twelve',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901245',
      email: 'user13@example.com',
      fullName: 'User Thirteen',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901246',
      email: 'user14@example.com',
      fullName: 'User Fourteen',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901247',
      email: 'user15@example.com',
      fullName: 'User Fifteen',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901248',
      email: 'user16@example.com',
      fullName: 'User Sixteen',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901249',
      email: 'user17@example.com',
      fullName: 'User Seventeen',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901250',
      email: 'user18@example.com',
      fullName: 'User Eighteen',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901251',
      email: 'user19@example.com',
      fullName: 'User Nineteen',
      password: 'User123',
      role: 'user',
    },
    {
      phoneNumber: '0978901252',
      email: 'user20@example.com',
      fullName: 'User Twenty',
      password: 'User123',
      role: 'user',
    },
  ];

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r]));
  const userMap: { [email: string]: { id: string } } = {};

  for (const userData of usersData) {
    const hashedPassword = await hashPassword(userData.password);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        provider: 'local',
        status: Math.random() >= 0.5,
      },
    });

    userMap[userData.email] = user;

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: roleMap[userData.role].id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: roleMap[userData.role].id,
      },
    });
  }

  return userMap;
}
