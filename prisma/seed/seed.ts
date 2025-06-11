import {
  PrismaClient,
  QuestionType,
  MentorBookingStatus,
  ExamStatus,
  SFIALevel,
  CompetencyDimension,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

// If you want to run seed. Follow steps below:
// 1. Run yarn db:reset if you have an existing data on your database
// 2. Run yarn db:seed to seed the database with sample data
// 3. Run yarn db:studio to view the database
// Ps: You can ask Mr.Nhat

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  // 1. Create permissions
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

  const permissions = [];
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissions.push(p);
  }

  // 2. Create roles
  const rolesData = [
    { name: 'super admin', description: 'Super administrator of system' },
    { name: 'admin', description: 'Administrator' },
    { name: 'company', description: 'Company owner/manager' },
    { name: 'user', description: 'Regular user' },
    { name: 'mentor', description: 'Mentor or coach' },
    { name: 'examiner', description: 'Can create and evaluate exams' },
  ];

  const roles = [];
  for (const role of rolesData) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        ...role,
        isOrganizationRole: false,
      },
    });
    roles.push(r);
  }

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r]));

  // 3. Assign permissions
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

  // 4. Create users and assign roles
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

  const userMap = {};
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

  // 6. Create Domains
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

  const domains = [];
  for (const domainData of domainsData) {
    const domain = await prisma.domain.upsert({
      where: { name: domainData.name },
      update: {},
      create: domainData,
    });
    domains.push(domain);
  }

  const domainMap = Object.fromEntries(domains.map((d) => [d.name, d]));

  const competencyFramework = [];

  const competencyFrameworkName = [
    {
      domainName: 'Healthcare',
      version: '1.0',
    },
    {
      domainName: 'Finance',
      version: '2.0',
    },
    {
      domainName: 'Education',
      version: '3.0',
    },
    {
      domainName: 'Information Technology',
      version: '4.0',
    },
    {
      domainName: 'General',
      version: '5.0',
    },
  ];
  for (const domainNameData of competencyFrameworkName) {
    const criterion = await prisma.competencyFramework.upsert({
      where: { id: domainMap[domainNameData.domainName].id },
      update: {},
      create: {
        version: domainNameData.version,
        domainId: domainMap[domainNameData.domainName].id,
      },
    });
    competencyFramework.push(criterion);
  }

  const competencyFrameworkMap = Object.fromEntries(competencyFramework.map((c) => [c.version, c]));

  // 8. Create Criteria with specified weights
  const competencyAreaDatas = [
    {
      name: 'MINDSET',
      description:
        'Psychological and cognitive foundations for AI adoption: ethics, adaptation, innovation mindset, and continuous learning capabilities.',
      scoreWeight: 0.4,
      dimension: CompetencyDimension.MINDSET,
      frameworkVersion: '5.0',
    },
    {
      name: 'SKILLSET',
      description:
        'Applied competencies for AI implementation: problem-solving, critical thinking, collaboration, and project execution skills.',
      scoreWeight: 0.35,
      dimension: CompetencyDimension.SKILLSET,
      frameworkVersion: '5.0',
    },
    {
      name: 'TOOLSET',
      description:
        'Technical proficiency with AI tools, platforms, and implementation methodologies in production environments.',
      scoreWeight: 0.25,
      dimension: CompetencyDimension.TOOLSET,
      frameworkVersion: '5.0',
    },
  ];

  const competencyArea = [];
  for (const competencyAreaData of competencyAreaDatas) {
    const criterion = await prisma.competencyArea.upsert({
      where: { id: '6f1e3d3c-1c5b-4d86-a3b4-2db53a7a3e8c' },
      update: {},
      create: {
        name: competencyAreaData.name,
        description: competencyAreaData.description,
        weightWithinDimension: competencyAreaData.scoreWeight,
        dimension: competencyAreaData.dimension,
        frameworkId: competencyFrameworkMap[competencyAreaData.frameworkVersion].id,
      },
    });
    competencyArea.push(criterion);
  }

  const competencyAreaMap = Object.fromEntries(competencyArea.map((c) => [c.name, c]));

  // 5. Create Categories (mindset, toolset, skillset)
  const categoriesData = [
    {
      name: 'AI Ethics & Responsibility',
      dimension: CompetencyDimension.MINDSET,
      description:
        'Ethical decision-making, bias mitigation, privacy protection, transparency, and responsible AI deployment in software systems.',
    },
    {
      dimension: CompetencyDimension.MINDSET,
      name: 'AI Problem-Solving & Domain Application',
      description:
        'Systematic problem decomposition, architectural design, domain-specific AI application, and complex system optimization.',
    },
  ];

  const categories = [];
  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: catData.name },
      update: {},
      create: {
        name: catData.name,
        description: catData.description,
        dimension: catData.dimension,
        competencyAreaId: competencyAreaMap[catData.dimension].id,
      },
    });
    categories.push(category);
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c]));

  // 9. Levels
  const levelsData = [
    {
      name: 'LEVEL_1 - AWARENESS',
      description: 'Làm việc dưới sự hướng dẫn chặt chẽ, thực hiện các nhiệm vụ đơn giản, hỗ trợ các hoạt động cơ bản',
      numericValue: 1,
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
    },
    {
      name: 'LEVEL_2 - FOUNDATION',
      description:
        'Thực hiện các nhiệm vụ được giao với một số tự chủ, hỗ trợ đồng nghiệp, làm việc trong quy trình đã định sẵn',
      numericValue: 2,
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
    },
    {
      name: 'LEVEL_3 - APPLICATION',
      description:
        'Xử lý các nhiệm vụ phức tạp hơn, áp dụng kiến thức chuyên môn, chịu trách nhiệm cho công việc cá nhân hoặc nhóm nhỏ',
      numericValue: 3,
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
    },
    {
      name: 'LEVEL_4 - INTEGRATION',
      description:
        'Quản lý và dẫn dắt các hoạt động, chịu trách nhiệm về kết quả, hỗ trợ người khác trong công việc chuyên môn',
      numericValue: 4,
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
    },
    {
      name: 'LEVEL_5 - INNOVATION',
      description: 'Lãnh đạo dự án hoặc nhóm, cung cấp tư vấn chuyên môn, đảm bảo chất lượng và hiệu quả công việc',
      numericValue: 5,
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
    },
    {
      name: 'LEVEL_6 - LEADERSHIP',
      description: 'Định hình chiến lược, lãnh đạo các sáng kiến lớn, tạo tác động rộng trong tổ chức hoặc ngành',
      numericValue: 6,
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
    },
    {
      name: 'LEVEL_7 - MASTERY',
      description:
        'Thiết lập chiến lược cấp cao, lãnh đạo tổ chức, truyền cảm hứng và thúc đẩy thay đổi ở cấp độ ngành hoặc toàn cầu',
      numericValue: 7,
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
    },
  ];
  const levels = [];
  for (const catData of levelsData) {
    const level = await prisma.level.upsert({
      where: { name: catData.name },
      update: {},
      create: catData,
    });
    levels.push(level);
  }

  const levelsMap = Object.fromEntries(levels.map((c) => [c.name, c]));

  //CompetencySkill
  const competencySkillData = [
    {
      name: 'LEVEL_1 - BASIC IT SKILLS',
      description:
        'Basic computer operations, using standard office software, understanding fundamental IT concepts and terminology',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'AI Ethics & Responsibility',
    },
    {
      name: 'LEVEL_2 - TECHNICAL SUPPORT',
      description:
        'Hardware/software troubleshooting, basic network configuration, user support, system maintenance tasks',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'AI Problem-Solving & Domain Application',
    },
    {
      name: 'LEVEL_3 - SYSTEM ADMINISTRATION',
      description:
        'Managing servers, network infrastructure, security implementation, database administration, user management',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'AI Problem-Solving & Domain Application',
    },
    {
      name: 'LEVEL_4 - IT PROJECT MANAGEMENT',
      description: 'Leading IT projects, system integration, team coordination, resource planning, risk management',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'AI Problem-Solving & Domain Application',
    },
    {
      name: 'LEVEL_5 - IT ARCHITECTURE',
      description:
        'Designing enterprise solutions, technology strategy, system optimization, performance tuning, technical consulting',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'AI Problem-Solving & Domain Application',
    },
    {
      name: 'LEVEL_6 - IT DIRECTOR',
      description:
        'Digital transformation leadership, IT governance, strategic planning, enterprise architecture, vendor management',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'AI Problem-Solving & Domain Application',
    },
    {
      name: 'LEVEL_7 - CHIEF TECHNOLOGY OFFICER',
      description:
        'Technology vision and strategy, digital innovation, enterprise-wide IT leadership, industry thought leadership',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'AI Problem-Solving & Domain Application',
    },
  ];

  const competencySkills = [];
  for (const competentcy of competencySkillData) {
    const competencySkill = await prisma.competencySkill.upsert({
      where: { id: '6f1e3d3c-1c5b-4d86-a3b4-2db53a7a3e8c' },
      update: {},
      create: {
        name: competentcy.name,
        description: competentcy.description,
        sfiaLevel: competentcy.sfiaLevel,
        categoryId: categoryMap[competentcy.compatencyAreaName].id,
      },
    });
    competencySkills.push(competencySkill);
  }

  const competenciesSkillMap = Object.fromEntries(competencySkills.map((c) => [c.name, c]));

  // 10. Create Questions
  const questionsData = [
    // Part 1
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'AI Generative là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Các thuật toán AI chỉ phân loại dữ liệu sẵn có', isCorrect: false },
        { content: 'Các hệ thống AI có khả năng tạo ra nội dung mới như văn bản, hình ảnh, âm thanh', isCorrect: true },
        { content: 'Hệ thống AI chỉ hoạt động trên dữ liệu cố định', isCorrect: false },
        { content: 'Công nghệ để robot có thể tự di chuyển', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Large Language Models (LLMs) sử dụng kiến trúc cơ bản nào?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Convolutional Neural Networks', isCorrect: false },
        { content: 'Recurrent Neural Networks', isCorrect: false },
        { content: 'Transformer Architecture', isCorrect: true },
        { content: 'Reinforcement Learning Networks', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Context Window trong LLMs là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Kích thước màn hình hiển thị kết quả', isCorrect: false },
        { content: 'Số lượng token (từ/ký tự) mà mô hình có thể xử lý cùng một lúc', isCorrect: true },
        { content: 'Thời gian mô hình cần để đưa ra kết quả', isCorrect: false },
        { content: 'Số lượng người dùng có thể truy cập cùng lúc', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khái niệm "token" trong LLMs đề cập đến:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Đơn vị tiền tệ để sử dụng dịch vụ AI', isCorrect: false },
        { content: 'Các đơn vị xử lý cơ bản (thường là từ hoặc phần của từ)', isCorrect: true },
        { content: 'Mã bảo mật để truy cập API', isCorrect: false },
        { content: 'Số lượng queries người dùng được phép thực hiện', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Đâu KHÔNG phải là một ứng dụng phổ biến của AI trong phát triển phần mềm?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Tự động sinh mã nguồn', isCorrect: false },
        { content: 'Tạo và thực thi test cases', isCorrect: false },
        { content: 'Phân tích yêu cầu và tạo user stories', isCorrect: false },
        { content: 'Thay thế hoàn toàn các developer', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khái niệm "hallucination" trong LLMs đề cập đến hiện tượng gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Mô hình tạo hình ảnh không có thật', isCorrect: false },
        { content: 'Mô hình tạo ra thông tin không chính xác hoặc không tồn tại', isCorrect: true },
        { content: 'Mô hình không thể đưa ra kết quả', isCorrect: false },
        { content: 'Mô hình bị quá tải khi xử lý quá nhiều dữ liệu', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'AI Coding Assistants như GitHub Copilot được xây dựng chủ yếu dựa trên:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Expert Systems', isCorrect: false },
        { content: 'Large Language Models', isCorrect: true },
        { content: 'Trí tuệ tập thể của các developer', isCorrect: false },
        { content: 'Thuật toán di truyền', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Kỹ thuật "fine-tuning" trong ngữ cảnh LLMs là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Điều chỉnh giao diện người dùng', isCorrect: false },
        { content: 'Điều chỉnh mô hình đã được pre-train để phù hợp với nhiệm vụ cụ thể', isCorrect: true },
        { content: 'Tối ưu hóa tốc độ phản hồi', isCorrect: false },
        { content: 'Cải thiện khả năng đọc hiểu của người dùng', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Sự khác biệt chính giữa AI và Machine Learning là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'AI là khái niệm rộng hơn, trong khi Machine Learning là một tập con của AI', isCorrect: true },
        { content: 'Machine Learning rộng hơn, AI là một ứng dụng cụ thể', isCorrect: false },
        { content: 'Chúng là hai lĩnh vực hoàn toàn khác nhau', isCorrect: false },
        { content: 'Machine Learning chỉ sử dụng trong nghiên cứu, AI trong thực tế', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Transfer Learning trong ngữ cảnh AI là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chuyển dữ liệu giữa các thiết bị', isCorrect: false },
        { content: 'Áp dụng kiến thức đã học từ một nhiệm vụ để giải quyết nhiệm vụ khác', isCorrect: true },
        { content: 'Dịch văn bản giữa các ngôn ngữ', isCorrect: false },
        { content: 'Chuyển đổi giữa các framework AI khác nhau', isCorrect: false },
      ],
    },
    //Part 2
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Prompt Engineering là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Kỹ thuật thiết kế phần cứng cho AI', isCorrect: false },
        { content: 'Nghệ thuật viết câu lệnh để điều khiển đầu ra của mô hình AI', isCorrect: true },
        { content: 'Phương pháp lập trình các thuật toán AI', isCorrect: false },
        { content: 'Quy trình kiểm thử hệ thống AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Chain of Thought Prompting là kỹ thuật:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Tạo một chuỗi các prompts liên tiếp', isCorrect: false },
        { content: 'Hướng dẫn mô hình giải quyết vấn đề theo từng bước', isCorrect: true },
        { content: 'Liên kết nhiều mô hình AI với nhau', isCorrect: false },
        { content: 'Tạo mạng lưới các máy tính để tính toán song song', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Few-shot Learning trong Prompt Engineering là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Học với rất ít dữ liệu huấn luyện', isCorrect: false },
        { content: 'Cung cấp một số ví dụ trong prompt để hướng dẫn mô hình', isCorrect: true },
        { content: 'Sử dụng nhiều prompts ngắn', isCorrect: false },
        { content: 'Kỹ thuật học nhanh của AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Đâu là một nguyên tắc tốt khi viết prompt cho coding tasks?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Luôn yêu cầu AI viết càng nhiều code càng tốt', isCorrect: false },
        { content: 'Chỉ định rõ ngôn ngữ lập trình, format và các yêu cầu cụ thể', isCorrect: true },
        { content: 'Sử dụng các từ ngữ mơ hồ để AI có thể sáng tạo', isCorrect: false },
        { content: 'Tránh cung cấp context cụ thể để AI không bị ràng buộc', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'GitHub Copilot khác biệt với ChatGPT ở điểm nào?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Copilot không sử dụng AI', isCorrect: false },
        { content: 'Copilot được tối ưu hóa cho việc viết code và tích hợp với IDE', isCorrect: true },
        { content: 'ChatGPT không thể sinh mã', isCorrect: false },
        { content: 'Copilot không cần kết nối internet', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi sử dụng AI để generate code, việc nào sau đây là quan trọng nhất?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chấp nhận mọi đề xuất từ AI mà không kiểm tra', isCorrect: false },
        { content: 'Tạo càng nhiều code càng tốt trong thời gian ngắn', isCorrect: false },
        { content: 'Review, hiểu và test code do AI sinh ra', isCorrect: true },
        { content: 'Tránh mọi sửa đổi để không làm hỏng logic của AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'API của một LLM thường yêu cầu những thông tin gì trong một request cơ bản?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'User ID, password, và IP address', isCorrect: false },
        { content: 'Model, prompt (messages), và temperature', isCorrect: true },
        { content: 'Developer credentials và payment information', isCorrect: false },
        { content: 'Hardware specifications và memory requirements', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Temperature parameter trong API của LLMs ảnh hưởng đến:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Thời gian xử lý của mô hình', isCorrect: false },
        { content: 'Độ sáng tạo/ngẫu nhiên trong đầu ra', isCorrect: true },
        { content: 'Nhiệt độ của GPU khi xử lý', isCorrect: false },
        { content: 'Số lượng token mà mô hình có thể xử lý', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Role prompting là kỹ thuật:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Phân công vai trò cho các thành viên trong team', isCorrect: false },
        { content: 'Yêu cầu AI đóng vai một chuyên gia cụ thể khi trả lời', isCorrect: true },
        { content: 'Đánh giá hiệu suất của các vai trò khác nhau', isCorrect: false },
        { content: 'Phân quyền truy cập vào hệ thống AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Đâu KHÔNG phải là một AI coding assistant phổ biến?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'GitHub Copilot', isCorrect: false },
        { content: 'Claude Code', isCorrect: false },
        { content: 'AWS CodeGuru', isCorrect: false },
        { content: 'Microsoft Excel AI', isCorrect: true },
      ],
    },
    //Part 3
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Agile là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Một ngôn ngữ lập trình mới', isCorrect: false },
        { content: 'Một framework quản lý dự án linh hoạt, thích ứng với thay đổi', isCorrect: true },
        { content: 'Một công cụ tự động hóa quy trình phát triển', isCorrect: false },
        { content: 'Một loại AI chuyên dụng cho phát triển phần mềm', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: '"Sprint" trong mô hình Scrum là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Một cuộc họp hàng ngày', isCorrect: false },
        { content: 'Một khoảng thời gian cố định để hoàn thành một tập hợp công việc', isCorrect: true },
        { content: 'Một tool để quản lý code', isCorrect: false },
        { content: 'Một phương pháp để tăng tốc máy tính', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'User story trong phát triển phần mềm là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Một câu chuyện giải trí cho người dùng', isCorrect: false },
        { content: 'Mô tả không chính thức về một tính năng từ góc nhìn người dùng', isCorrect: true },
        { content: 'Hướng dẫn sử dụng phần mềm', isCorrect: false },
        { content: 'Báo cáo lỗi từ người dùng', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'CI/CD đề cập đến:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Control Interface/Command Display', isCorrect: false },
        { content: 'Continuous Integration/Continuous Deployment', isCorrect: true },
        { content: 'Computer Intelligence/Code Debugging', isCorrect: false },
        { content: 'Compiled Input/Cached Data', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Đâu là một design pattern phổ biến trong phát triển phần mềm?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Agile Pattern', isCorrect: false },
        { content: 'Singleton Pattern', isCorrect: true },
        { content: 'Testing Pattern', isCorrect: false },
        { content: 'Program Pattern', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Technical debt trong phát triển phần mềm là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chi phí mua thiết bị kỹ thuật', isCorrect: false },
        { content: 'Số tiền công ty nợ các developer', isCorrect: false },
        { content: 'Những giải pháp nhanh chóng, không tối ưu có thể gây vấn đề trong tương lai', isCorrect: true },
        { content: 'Phí bản quyền phần mềm', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Refactoring là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Viết lại toàn bộ code từ đầu', isCorrect: false },
        { content: 'Cải thiện cấu trúc code mà không thay đổi chức năng bên ngoài', isCorrect: true },
        { content: 'Thay đổi tên biến trong code', isCorrect: false },
        { content: 'Tối ưu hóa hiệu suất bằng cách thay đổi thuật toán', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Test-driven development (TDD) là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Phương pháp kiểm thử sau khi phát triển', isCorrect: false },
        { content: 'Viết test case trước khi viết code', isCorrect: true },
        { content: 'Để người dùng kiểm thử phần mềm', isCorrect: false },
        { content: 'Sử dụng AI để tự động kiểm thử', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'API là viết tắt của:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Advanced Programming Interface', isCorrect: false },
        { content: 'Application Programming Interface', isCorrect: true },
        { content: 'Automatic Program Installation', isCorrect: false },
        { content: 'Advanced Protocol Integration', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Version control system như Git có chức năng chính là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Kiểm soát phiên bản và quản lý thay đổi trong mã nguồn', isCorrect: true },
        { content: 'Tạo phiên bản mới của phần mềm', isCorrect: false },
        { content: 'Kiểm soát quyền truy cập vào database', isCorrect: false },
        { content: 'Tự động update phần mềm cho người dùng', isCorrect: false },
      ],
    },
    // Part 4
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'AI có thể hỗ trợ giai đoạn nào trong SDLC?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chỉ giai đoạn coding', isCorrect: false },
        { content: 'Chỉ giai đoạn testing', isCorrect: false },
        { content: 'Tất cả các giai đoạn từ planning đến maintenance', isCorrect: true },
        { content: 'Chỉ giai đoạn deployment', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'AI có thể hỗ trợ hoạt động nào sau đây trong giai đoạn Requirements Engineering?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Không thể hỗ trợ giai đoạn này', isCorrect: false },
        { content: 'Phân tích yêu cầu, tạo user stories và phát hiện mâu thuẫn', isCorrect: true },
        { content: 'Chỉ hỗ trợ việc gõ nhanh hơn', isCorrect: false },
        { content: 'Thay thế hoàn toàn product owner', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Trong giai đoạn design, AI có thể hỗ trợ:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chỉ tạo logo và giao diện', isCorrect: false },
        { content: 'Đề xuất kiến trúc hệ thống, schema database, và thiết kế API', isCorrect: true },
        { content: 'Không thể hỗ trợ giai đoạn này do tính sáng tạo cao', isCorrect: false },
        { content: 'Chỉ có thể vẽ sơ đồ nhưng không thể tạo nội dung', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'AI pair programming là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Hai AI làm việc cùng nhau', isCorrect: false },
        { content: 'Quá trình làm việc cùng AI như một partner trong lập trình', isCorrect: true },
        { content: 'Sao chép code từ nhiều nguồn AI', isCorrect: false },
        { content: 'Hai developers cùng sử dụng một AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Trong testing, AI có thể:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chỉ kiểm tra lỗi cú pháp', isCorrect: false },
        { content: 'Tạo test cases, tự động hóa việc testing và phát hiện lỗi', isCorrect: true },
        { content: 'Không thể hỗ trợ testing do độ phức tạp', isCorrect: false },
        { content: 'Chỉ kiểm tra UI, không kiểm tra logic', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi sử dụng AI để phát triển phần mềm, vấn đề đạo đức quan trọng nhất là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Tốc độ của AI', isCorrect: false },
        { content: 'Chi phí sử dụng AI', isCorrect: false },
        { content: 'Bản quyền, sở hữu trí tuệ và trách nhiệm với code do AI tạo ra', isCorrect: true },
        { content: 'Tính thẩm mỹ của code', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Trong documentation, AI có thể hỗ trợ:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chỉ tạo hình ảnh minh họa', isCorrect: false },
        { content: 'Tự động tạo và cập nhật tài liệu kỹ thuật, API docs, và hướng dẫn người dùng', isCorrect: true },
        { content: 'Không thể hỗ trợ do cần hiểu sâu về ngữ cảnh', isCorrect: false },
        { content: 'Chỉ dịch tài liệu sang ngôn ngữ khác', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Benchmarking cho AI-assisted development nên tập trung vào:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Chỉ tốc độ phát triển', isCorrect: false },
        { content: 'Số lượng code được tạo ra', isCorrect: false },
        { content: 'Nhiều yếu tố: tốc độ, chất lượng, khả năng bảo trì, tỷ lệ lỗi', isCorrect: true },
        { content: 'Chỉ số lượng developer cần thiết', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi sử dụng AI trong code review, best practice là:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Luôn chấp nhận mọi đề xuất của AI', isCorrect: false },
        { content: 'Sử dụng AI như một reviewer bổ sung, không thay thế human review', isCorrect: true },
        { content: 'Chỉ sử dụng AI cho reviews nội bộ, không cho production code', isCorrect: false },
        { content: 'Tránh sử dụng AI vì không đáng tin cậy', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Tương lai của phát triển phần mềm với AI có khả năng:',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'AI sẽ thay thế hoàn toàn developers trong 2-3 năm tới', isCorrect: false },
        { content: 'AI sẽ làm chậm phát triển phần mềm do phức tạp hóa quy trình', isCorrect: false },
        { content: 'AI sẽ trở thành một tool hỗ trợ quan trọng, nâng cao năng suất và chất lượng', isCorrect: true },
        { content: 'AI sẽ chỉ giới hạn trong các công ty lớn, không phổ biến trong công nghiệp', isCorrect: false },
      ],
    },
    // Part 5
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Theo bạn, vai trò chính của AI trong quy trình phát triển phần mềm là gì?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Thay thế hoàn toàn developer để giảm chi phí nhân sự', isCorrect: false },
        { content: 'Là công cụ hỗ trợ, tăng cường năng suất và sáng tạo của developer', isCorrect: true },
        { content: 'Chỉ để thực hiện các tác vụ đơn giản, lặp đi lặp lại', isCorrect: false },
        { content: 'Chủ yếu để marketing, không có giá trị thực sự trong phát triển', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi AI tạo ra code có lỗi hoặc không hoạt động như mong đợi, trách nhiệm thuộc về ai?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Nhà phát triển AI vì đã tạo ra một sản phẩm không hoàn hảo', isCorrect: false },
        { content: 'Developer đã sử dụng code đó, vì đã không kiểm tra kỹ lưỡng', isCorrect: true },
        { content: 'Không ai cả, đó là rủi ro khi sử dụng công nghệ mới', isCorrect: false },
        { content: 'Tổ chức quản lý dự án vì đã cho phép sử dụng AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Theo bạn, khi làm việc với AI, developers cần phát triển kỹ năng nào nhất?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Tối ưu hóa prompt để AI tạo ra kết quả tốt hơn', isCorrect: false },
        { content: 'Đánh giá, kiểm tra và tích hợp đầu ra của AI một cách phù hợp', isCorrect: true },
        { content: 'Học cách phụ thuộc hoàn toàn vào AI để tăng tốc độ', isCorrect: false },
        { content: 'Tránh sử dụng AI càng nhiều càng tốt để giữ kỹ năng coding', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Đâu là thách thức lớn nhất khi áp dụng AI vào quy trình phát triển phần mềm?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Khó khăn kỹ thuật khi tích hợp công cụ AI', isCorrect: false },
        { content: 'Chi phí sử dụng các công cụ AI cao', isCorrect: false },
        { content: 'Thay đổi mindset và văn hóa làm việc để khai thác tối đa tiềm năng AI', isCorrect: true },
        { content: 'Đào tạo nhân viên sử dụng thành thạo công cụ AI', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Khi sử dụng AI để phát triển phần mềm, đâu là cách tiếp cận tốt nhất?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Áp dụng AI vào mọi khía cạnh của dự án ngay lập tức', isCorrect: false },
        { content: 'Thử nghiệm dần dần, đánh giá hiệu quả và mở rộng áp dụng khi phù hợp', isCorrect: true },
        { content: 'Chỉ sử dụng AI cho các dự án nhỏ, không quan trọng', isCorrect: false },
        { content: 'Chờ đợi công nghệ AI trưởng thành hơn rồi mới áp dụng', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Trong bối cảnh AI phát triển nhanh chóng, đâu là thái độ phù hợp nhất của một developer?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Lo lắng vì AI sẽ thay thế công việc của mình', isCorrect: false },
        { content: 'Lạc quan thái quá, tin rằng AI sẽ giải quyết mọi vấn đề', isCorrect: false },
        { content: 'Tò mò, học hỏi liên tục và thích nghi với công nghệ mới', isCorrect: true },
        { content: 'Thờ ơ vì cho rằng AI chỉ là xu hướng tạm thời', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      content:
        'Với việc AI có thể tạo ra code nhanh chóng, điều quan trọng nhất developer cần tập trung phát triển là:',
      answerOptions: [
        { content: 'Tốc độ coding để cạnh tranh với AI', isCorrect: false },
        { content: 'Kỹ năng giải quyết vấn đề, tư duy hệ thống và hiểu biết về business domain', isCorrect: true },
        { content: 'Khả năng làm việc không cần AI để không phụ thuộc', isCorrect: false },
        { content: 'Tập trung vào debugging vì AI sẽ tạo ra nhiều lỗi', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Cách nào sau đây KHÔNG phù hợp khi gặp khó khăn với AI trong phát triển phần mềm?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Phân tích nguyên nhân và điều chỉnh cách sử dụng', isCorrect: false },
        { content: 'Từ bỏ AI hoàn toàn và quay lại phương pháp truyền thống', isCorrect: true },
        { content: 'Tham khảo cộng đồng và học hỏi best practices', isCorrect: false },
        { content: 'Kết hợp nhiều phương pháp và công cụ AI khác nhau', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Theo bạn, đâu là khía cạnh quan trọng nhất khi xây dựng văn hóa AI-assisted development trong team?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'Áp đặt việc sử dụng AI cho mọi thành viên', isCorrect: false },
        { content: 'Tạo không gian an toàn để thử nghiệm, chia sẻ kinh nghiệm và học hỏi lẫn nhau', isCorrect: true },
        { content: 'Đánh giá hiệu suất dựa trên mức độ sử dụng AI', isCorrect: false },
        { content: 'Tách biệt team thành nhóm sử dụng AI và nhóm không sử dụng', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Đâu là mindset lành mạnh nhất về vai trò của AI trong tương lai ngành phát triển phần mềm?',
      level: 'LEVEL_1 - AWARENESS',
      compatentcySkillName: 'LEVEL_1 - BASIC IT SKILLS',
      answerOptions: [
        { content: 'AI sẽ thay thế phần lớn developers, nên cần chuyển ngành sớm', isCorrect: false },
        { content: 'AI chỉ là công cụ tạm thời, sẽ sớm bị thay thế bởi công nghệ khác', isCorrect: false },
        { content: 'AI và con người sẽ cùng tiến hóa, bổ sung cho nhau với vai trò khác nhau', isCorrect: true },
        { content: 'AI sẽ chỉ phù hợp với các công ty lớn, không ảnh hưởng đến phần lớn developers', isCorrect: false },
      ],
    },
  ];

  const questions = [];
  for (const qData of questionsData) {
    // Create the question
    const question = await prisma.question.create({
      data: {
        type: qData.type,
        content: qData.content,
        levelId: levelsMap[qData.level].id,
        competencySkillId: competenciesSkillMap[qData.compatentcySkillName].id,
      },
    });

    questions.push(question);

    // Create answer options
    for (const optionData of qData.answerOptions) {
      await prisma.answerOption.create({
        data: {
          content: optionData.content,
          isCorrect: optionData.isCorrect,
          questionId: question.id,
        },
      });
    }
  }

  // 11. Create Courses
  const coursesData = [
    {
      title: 'Introduction to AI Ethics',
      description: 'A foundational course on ethical considerations in AI development and deployment',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-ethics',
      category: 'AI Ethics & Responsibility',
      domain: 'General',
    },
    {
      title: 'Machine Learning with Python',
      description: 'Learn practical machine learning techniques using Python',
      provider: 'edX',
      url: 'https://www.edx.org/learn/machine-learning',
      category: 'AI Problem-Solving & Domain Application',
      domain: 'General',
    },
    {
      title: 'AI for Healthcare',
      description: 'Applications of AI in healthcare diagnostics and treatment',
      provider: 'Udacity',
      url: 'https://www.udacity.com/course/ai-for-healthcare',
      category: 'AI Ethics & Responsibility',
      domain: 'Healthcare',
    },
    {
      title: 'Financial Analysis with AI',
      description: 'Using AI techniques for financial forecasting and analysis',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/financial-analysis-ai',
      category: 'AI Problem-Solving & Domain Application',
      domain: 'Finance',
    },
    {
      title: 'Critical Thinking for AI Implementation',
      description: 'Developing critical thinking skills for evaluating AI applications',
      provider: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning/critical-thinking-ai',
      category: 'AI Ethics & Responsibility',
      domain: 'General',
    },
    {
      title: 'AI in Information Technology',
      description: 'Practical applications of AI in Information Technology processes',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-Information Technology',
      category: 'AI Problem-Solving & Domain Application',
      domain: 'Information Technology',
    },
  ];

  for (const courseData of coursesData) {
    await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        provider: courseData.provider,
        url: courseData.url,
        categoryId: categoryMap[courseData.category].id,
        domainId: domainMap[courseData.domain].id,
      },
    });
  }

  // 12. Create Exam Sets
  const examSetsData = [
    {
      name: 'AI Foundations Assessment',
      description: 'Basic assessment of foundational AI knowledge',
      questions: [0, 2, 5, 8], // Indices from the questions array
      frameworkVersion: '5.0',
    },
    {
      name: 'AI Ethics and Impact',
      description: 'Assessment focusing on ethical considerations and societal impacts of AI',
      questions: [4, 7, 9], // Indices from the questions array
      frameworkVersion: '5.0',
    },
    {
      name: 'AI Tools and Applications',
      description: 'Assessment of practical AI tools and applications knowledge',
      questions: [1, 3, 6], // Indices from the questions array
      frameworkVersion: '5.0',
    },
    {
      name: 'AI INPUT TEST',
      description:
        'Bài kiểm tra đánh giá đầu vào cho các bạn đã có kiến thức về AI, là developer và muốn nâng cao kiến thức về AI',
      questions: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
      ], // All questions
      frameworkVersion: '5.0',
    },
  ];

  for (const examSetData of examSetsData) {
    const examSet = await prisma.examSet.create({
      data: {
        name: examSetData.name,
        description: examSetData.description,
        timeLimitMinutes: 40,
        frameworkId: competencyFrameworkMap[examSetData.frameworkVersion].id,
      },
    });

    // Link questions to exam set
    for (let i = 0; i < examSetData.questions.length; i++) {
      const questionIndex = examSetData.questions[i];
      await prisma.examSetQuestion.create({
        data: {
          examSetId: examSet.id,
          questionId: questions[questionIndex].id,
          orderIndex: i + 1,
        },
      });
    }
  }

  // 13. Create some sample exams
  const examData = [
    {
      email: 'user1@example.com',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes after start
      totalScore: 75.5,
    },
    {
      email: 'user2@example.com',
      examSetName: 'AI Ethics and Impact',
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      finishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 60 minutes after start
      totalScore: 82.0,
    },
    {
      email: 'user2@example.com',
      examSetName: 'AI Foundations Assessment',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      finishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes after start
      totalScore: 75.5,
    },
    {
      email: 'user@example.com',
      examSetName: 'AI INPUT TEST',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      finishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 minutes after start
      totalScore: 68.5,
    },
  ];

  const examSets = await prisma.examSet.findMany();
  const examSetMap = Object.fromEntries(examSets.map((es) => [es.name, es]));
  const examMap = {};
  for (const data of examData) {
    const exam = await prisma.exam.create({
      data: {
        userId: userMap[data.email].id,
        examSetId: examSetMap[data.examSetName].id,
        startedAt: data.startedAt,
        finishedAt: data.finishedAt,
      },
    });
    examMap[`${data.email}-${data.examSetName}`] = exam;
  }

  // 14. Create Mentors
  const mentorsData = [
    {
      email: 'mentor1@example.com',
      expertise: 'Machine Learning, Deep Learning, Computer Vision',
    },
    {
      email: 'mentor2@example.com',
      expertise: 'Natural Language Processing, Transformers, BERT',
    },
    {
      email: 'mentor3@example.com',
      expertise: 'Reinforcement Learning, Game AI, Decision Making',
    },
    {
      email: 'mentor4@example.com',
      expertise: 'Data Science, Statistical Analysis, Big Data',
    },
    {
      email: 'mentor5@example.com',
      expertise: 'AI Ethics, Responsible AI Development, Fairness',
    },
    {
      email: 'mentor6@example.com',
      expertise: 'Robotics, Computer Vision, Sensor Fusion',
    },
    {
      email: 'mentor7@example.com',
      expertise: 'MLOps, AI Infrastructure, Model Deployment',
    },
    {
      email: 'mentor8@example.com',
      expertise: 'AI in Healthcare, Medical Imaging, Bioinformatics',
    },
    {
      email: 'mentor9@example.com',
      expertise: 'AI for Finance, Quantitative Analysis, Risk Assessment',
    },
    {
      email: 'mentor10@example.com',
      expertise: 'Edge AI, IoT, Embedded Systems',
    },
    {
      email: 'mentor11@example.com',
      expertise: 'AI Security, Adversarial ML, Privacy',
    },
    {
      email: 'mentor12@example.com',
      expertise: 'Generative AI, GANs, Diffusion Models',
    },
    {
      email: 'mentor13@example.com',
      expertise: 'AI Research, Academic Publishing, Scientific Methods',
    },
    {
      email: 'mentor14@example.com',
      expertise: 'AI Product Management, Strategy, Business Impact',
    },
    {
      email: 'mentor15@example.com',
      expertise: 'Speech Recognition, Audio Processing, Voice AI',
    },
    {
      email: 'mentor16@example.com',
      expertise: 'AI for Climate Change, Environmental Modeling, Sustainability',
    },
    {
      email: 'mentor17@example.com',
      expertise: 'AI Education, Curriculum Development, Teaching',
    },
    {
      email: 'mentor18@example.com',
      expertise: 'AI in Agriculture, Precision Farming, Crop Analysis',
    },
    {
      email: 'mentor19@example.com',
      expertise: 'AI for Social Good, Humanitarian AI, Impact Assessment',
    },
    {
      email: 'mentor20@example.com',
      expertise: 'AI Startups, Entrepreneurship, Innovation',
    },
    {
      email: 'admin@example.com', // Admin can also be a mentor
      expertise: 'AI Ethics, Responsible AI, Policy',
    },
  ];

  for (const mentorData of mentorsData) {
    await prisma.mentor.create({
      data: {
        userId: userMap[mentorData.email].id,
        expertise: mentorData.expertise,
        sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      },
    });
  }
  // 15. Create Mentor Bookings
  const mentors = await prisma.mentor.findMany({
    include: {
      user: true,
    },
  });

  // 20 mentees bookings for each mentor
  const mentorBookingsData = [];
  const mentorEmails = mentorsData.map((mentor) => mentor.email);
  const userEmails = usersData.filter((user) => user.role === 'user').map((user) => user.email);

  function randomFutureDate(daysAhead = 30) {
    const randomDays = Math.floor(Math.random() * daysAhead) + 1;
    const date = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  mentorEmails.forEach((mentorEmail, mentorIndex) => {
    for (let i = 0; i < 20; i++) {
      const menteeIndex = (mentorIndex * 20 + i) % userEmails.length;
      mentorBookingsData.push({
        userEmail: userEmails[menteeIndex],
        mentorEmail,
        scheduledAt: randomFutureDate(),
        timeSlot: 'AM_08_09',
        status: MentorBookingStatus.ACCEPTED,
        notes: `Session between ${userEmails[menteeIndex]} and ${mentorEmail}`,
      });
    }
  });

  const mentorEmailMap = {};
  for (const mentor of mentors) {
    const email = mentor.user.email;
    mentorEmailMap[email] = mentor;
  }

  for (const bookingData of mentorBookingsData) {
    await prisma.mentorBooking.create({
      data: {
        userId: userMap[bookingData.userEmail].id,
        mentorId: mentorEmailMap[bookingData.mentorEmail].id,
        scheduledAt: bookingData.scheduledAt,
        status: bookingData.status,
        notes: bookingData.notes,
      },
    });
  }

  // 16. Create sample user answers
  const sampleUserAnswers = [
    {
      email: 'user1@example.com',
      questionIndex: 0, // Single choice question
      answerText: 'Học qua internet (Internet Learning)',
      manualScore: null,
      autoScore: 10,
      answerOptionIndex: 3, // The correct option (Học qua internet)
      examSetName: 'AI Foundations Assessment',
    },
    {
      email: 'user1@example.com',
      questionIndex: 2, // True/false question
      answerText: 'Đúng',
      manualScore: null,
      autoScore: 10,
      answerOptionIndex: 0, // The correct option (Đúng)
      examSetName: 'AI Foundations Assessment',
    },
    {
      email: 'user2@example.com',
      questionIndex: 3, // Essay question
      answerText:
        'Để thiết kế hệ thống AI hỗ trợ chẩn đoán y tế, tôi sẽ xây dựng một hệ thống dựa trên mô hình học sâu kết hợp với quy trình xác thực lâm sàng. Hệ thống sẽ gồm các thành phần: 1) Module thu thập và xử lý dữ liệu hình ảnh y tế, 2) Mô hình AI phân loại và nhận diện bất thường, 3) Hệ thống giải thích kết quả, 4) Interface người dùng thân thiện cho nhân viên y tế. Dữ liệu cần thiết bao gồm datasets hình ảnh y tế được gán nhãn bởi chuyên gia, hồ sơ bệnh án, và thông tin kết quả điều trị. Các thách thức chính bao gồm: bảo mật dữ liệu bệnh nhân, đảm bảo độ chính xác và tin cậy trong chẩn đoán, giải quyết vấn đề thiếu minh bạch trong AI, và tích hợp vào quy trình làm việc hiện tại của các cơ sở y tế.',
      manualScore: 18,
      autoScore: null,
      answerOptionIndex: null, // Essay doesn't have options
      examSetName: 'AI Foundations Assessment',
    },
    {
      email: 'user@example.com',
      questionIndex: 4, // Essay question about ethics
      answerText:
        'AI trong tuyển dụng có thể cải thiện hiệu quả quy trình nhưng cũng gây ra nhiều vấn đề đạo đức và xã hội. Trước tiên, AI có thể tạo ra thiên kiến khi được huấn luyện trên dữ liệu lịch sử có thể bất công với các nhóm thiểu số. Thứ hai, việc thiếu minh bạch trong quá trình ra quyết định có thể làm ứng viên cảm thấy bị đối xử bất công. Thứ ba, quá phụ thuộc vào AI có thể dẫn đến việc bỏ lỡ những ứng viên tiềm năng có tài năng nhưng không phù hợp với tiêu chí máy móc. Để giảm thiểu rủi ro, các tổ chức cần: đảm bảo dữ liệu huấn luyện đa dạng và công bằng, thiết lập quy trình kiểm tra và đánh giá thường xuyên, kết hợp đánh giá của con người và AI, cung cấp thông tin minh bạch cho ứng viên, và tuân thủ các quy định pháp lý về quyền riêng tư và công bằng trong tuyển dụng.',
      manualScore: 19,
      autoScore: null,
      answerOptionIndex: null, // Essay doesn't have options
      examSetName: 'AI INPUT TEST',
    },
    {
      email: 'user@example.com',
      questionIndex: 1, // Multiple choice
      answerText: 'GPT-4, Claude, Llama 2',
      manualScore: null,
      autoScore: 10,
      answerOptionIndex: null,
      answerOptionIndices: [0, 1, 3], // The correct options
      examSetName: 'AI INPUT TEST',
    },
  ];

  for (const answerData of sampleUserAnswers) {
    const exam = examMap[`${answerData.email}-${answerData.examSetName}`];
    const userAnswer = await prisma.userAnswer.create({
      data: {
        userId: userMap[answerData.email].id,
        questionId: questions[answerData.questionIndex].id,
        answerText: answerData.answerText,
        manualScore: answerData.manualScore,
        autoScore: answerData.autoScore,
        maxPossibleScore: 10,
        examId: exam.id,
      },
    });

    // For multiple choice or single choice questions
    if (
      answerData.answerOptionIndex !== null ||
      (answerData.answerOptionIndices && answerData.answerOptionIndices.length)
    ) {
      // Get answer options for this question
      const answerOptions = await prisma.answerOption.findMany({
        where: {
          questionId: questions[answerData.questionIndex].id,
        },
      });
      // Single choice
      if (answerData.answerOptionIndex !== null) {
        await prisma.userAnswerSelection.create({
          data: {
            userAnswerId: userAnswer.id,
            answerOptionId: answerOptions[answerData.answerOptionIndex].id,
          },
        });
      }
      // Multiple choice
      else if (answerData.answerOptionIndices) {
        for (const optionIndex of answerData.answerOptionIndices) {
          const selectedOption = answerOptions[optionIndex];
          if (!selectedOption) {
            throw new Error(
              `❌ answerOptions[${optionIndex}] is undefined for questionIndex ${answerData.questionIndex}`
            );
          }
          await prisma.userAnswerSelection.create({
            data: {
              userAnswerId: userAnswer.id,
              answerOptionId: answerOptions[optionIndex].id,
            },
          });
        }
      }
    }
  }

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
