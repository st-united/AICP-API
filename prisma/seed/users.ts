import { PrismaClient, Role, Domain } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Vietnam provinces data
const VIETNAM_PROVINCES = [
  'Thành phố Hà Nội',
  'Tỉnh Hà Giang',
  'Tỉnh Cao Bằng',
  'Tỉnh Bắc Kạn',
  'Tỉnh Tuyên Quang',
  'Tỉnh Lào Cai',
  'Tỉnh Điện Biên',
  'Tỉnh Lai Châu',
  'Tỉnh Sơn La',
  'Tỉnh Yên Bái',
  'Tỉnh Hoà Bình',
  'Tỉnh Thái Nguyên',
  'Tỉnh Lạng Sơn',
  'Tỉnh Quảng Ninh',
  'Tỉnh Bắc Giang',
  'Tỉnh Phú Thọ',
  'Tỉnh Vĩnh Phúc',
  'Tỉnh Bắc Ninh',
  'Tỉnh Hải Dương',
  'Thành phố Hải Phòng',
  'Tỉnh Hưng Yên',
  'Tỉnh Thái Bình',
  'Tỉnh Hà Nam',
  'Tỉnh Nam Định',
  'Tỉnh Ninh Bình',
  'Tỉnh Thanh Hóa',
  'Tỉnh Nghệ An',
  'Tỉnh Hà Tĩnh',
  'Tỉnh Quảng Bình',
  'Tỉnh Quảng Trị',
  'Thành phố Huế',
  'Thành phố Đà Nẵng',
  'Tỉnh Quảng Nam',
  'Tỉnh Quảng Ngãi',
  'Tỉnh Bình Định',
  'Tỉnh Phú Yên',
  'Tỉnh Khánh Hòa',
  'Tỉnh Ninh Thuận',
  'Tỉnh Bình Thuận',
  'Tỉnh Kon Tum',
  'Tỉnh Gia Lai',
  'Tỉnh Đắk Lắk',
  'Tỉnh Đắk Nông',
  'Tỉnh Lâm Đồng',
  'Tỉnh Bình Phước',
  'Tỉnh Tây Ninh',
  'Tỉnh Bình Dương',
  'Tỉnh Đồng Nai',
  'Tỉnh Bà Rịa - Vũng Tàu',
  'Thành phố Hồ Chí Minh',
  'Tỉnh Long An',
  'Tỉnh Tiền Giang',
  'Tỉnh Bến Tre',
  'Tỉnh Trà Vinh',
  'Tỉnh Vĩnh Long',
  'Tỉnh Đồng Tháp',
  'Tỉnh An Giang',
  'Tỉnh Kiên Giang',
  'Thành phố Cần Thơ',
  'Tỉnh Hậu Giang',
  'Tỉnh Sóc Trăng',
  'Tỉnh Bạc Liêu',
  'Tỉnh Cà Mau',
];

function getRandomDomains(domains: Domain[], minCount: number = 1, maxCount: number = 3): Domain[] {
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const shuffled = [...domains].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random province
function getRandomProvince(): string {
  const randomIndex = Math.floor(Math.random() * VIETNAM_PROVINCES.length);
  return VIETNAM_PROVINCES[randomIndex];
}

export async function seedUsers(
  prisma: PrismaClient,
  roles: Role[],
  domains: Domain[]
): Promise<{ [email: string]: { id: string } }> {
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
    const userDomains = getRandomDomains(domains);
    const userProvince = getRandomProvince();

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
        province: userProvince,
        job: {
          connect: userDomains.map((domain) => ({ id: domain.id })),
        },
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
