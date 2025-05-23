import { PrismaClient, QuestionType, DifficultyLevel, MentorBookingStatus } from '@prisma/client';
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
    { name: 'View Dashboard', slug: 'view-dashboard', description: 'Can view dashboard' },
    { name: 'Manage Users', slug: 'manage-users', description: 'Can manage users' },
    { name: 'Manage Roles', slug: 'manage-roles', description: 'Can manage roles' },
    { name: 'Manage Companies', slug: 'manage-companies', description: 'Can manage companies' },
    { name: 'Create Questions', slug: 'create-questions', description: 'Can create questions' },
    { name: 'Edit Questions', slug: 'edit-questions', description: 'Can edit questions' },
    { name: 'Delete Questions', slug: 'delete-questions', description: 'Can delete questions' },
    { name: 'View Exams', slug: 'view-exams', description: 'Can view exams' },
    { name: 'Create Exams', slug: 'create-exams', description: 'Can create exams' },
    { name: 'Evaluate Answers', slug: 'evaluate-answers', description: 'Can evaluate user answers' },
    { name: 'Manage Mentors', slug: 'manage-mentors', description: 'Can manage mentors' },
    { name: 'Book Mentors', slug: 'book-mentors', description: 'Can book mentors' },
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
    'view-dashboard',
    'manage-users',
    'manage-roles',
    'create-questions',
    'edit-questions',
    'delete-questions',
    'view-exams',
    'manage-mentors',
  ]);
  await assignRolePermission('company', ['manage-companies', 'view-dashboard', 'view-exams']);
  await assignRolePermission('user', ['view-dashboard', 'book-mentors']);
  await assignRolePermission('mentor', ['view-dashboard']);
  await assignRolePermission('examiner', [
    'view-dashboard',
    'create-questions',
    'edit-questions',
    'create-exams',
    'evaluate-answers',
    'view-exams',
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
        status: true,
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

  // 5. Create Categories (mindset, toolset, skillset)
  const categoriesData = [
    {
      name: 'mindset',
      description: 'Thinking frameworks and perspectives for AI readiness',
    },
    {
      name: 'toolset',
      description: 'Practical tools and technologies related to AI',
    },
    {
      name: 'skillset',
      description: 'Technical and non-technical skills for AI implementation',
    },
  ];

  const categories = [];
  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: catData.name },
      update: {},
      create: catData,
    });
    categories.push(category);
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c]));

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
      name: 'Manufacturing',
      description: 'AI applications in manufacturing and production',
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

  // 7. Create Category-Domain relationships
  const categoryDomains = [
    { category: 'mindset', domain: 'General' },
    { category: 'mindset', domain: 'Healthcare' },
    { category: 'mindset', domain: 'Finance' },
    { category: 'toolset', domain: 'General' },
    { category: 'toolset', domain: 'Manufacturing' },
    { category: 'toolset', domain: 'Education' },
    { category: 'skillset', domain: 'General' },
    { category: 'skillset', domain: 'Finance' },
    { category: 'skillset', domain: 'Healthcare' },
  ];

  for (const cd of categoryDomains) {
    await prisma.categoryDomain.upsert({
      where: {
        categoryId_domainId: {
          categoryId: categoryMap[cd.category].id,
          domainId: domainMap[cd.domain].id,
        },
      },
      update: {},
      create: {
        categoryId: categoryMap[cd.category].id,
        domainId: domainMap[cd.domain].id,
      },
    });
  }

  // 8. Create Criteria with specified weights
  const criteriaData = [
    {
      name: 'Kiến thức nền tảng về AI',
      description: 'Nắm chắc nền tảng, tránh dùng sai AI',
      scoreWeight: 0.2, // 20%
    },
    {
      name: 'Ứng dụng công cụ/mô hình AI',
      description: 'Cốt lõi để dùng AI đúng cách và an toàn',
      scoreWeight: 0.25, // 25%
    },
    {
      name: 'Thiết kế hệ thống hoặc giải pháp AI',
      description: 'Thực hành quan trọng, liên quan trực tiếp đến năng suất',
      scoreWeight: 0.2, // 20%
    },
    {
      name: 'Đạo đức và tác động xã hội của AI',
      description: 'Tư duy chủ động, cần thiết để tránh sai lệch',
      scoreWeight: 0.2, // 20%
    },
    {
      name: 'Kỹ năng tư duy phản biện và trình bày',
      description: 'Đảm bảo tính trung thực, học thuật, rõ ràng',
      scoreWeight: 0.15, // 15%
    },
  ];

  const criteria = [];
  for (const critData of criteriaData) {
    const criterion = await prisma.criteria.upsert({
      where: { name: critData.name },
      update: {},
      create: critData,
    });
    criteria.push(criterion);
  }

  const criteriaMap = Object.fromEntries(criteria.map((c) => [c.name, c]));

  // 9. Link Criteria to Categories
  const criteriaCategoryLinks = [
    { criteria: 'Kiến thức nền tảng về AI', categories: ['mindset', 'skillset'] },
    { criteria: 'Ứng dụng công cụ/mô hình AI', categories: ['toolset', 'skillset'] },
    { criteria: 'Thiết kế hệ thống hoặc giải pháp AI', categories: ['skillset', 'toolset'] },
    { criteria: 'Đạo đức và tác động xã hội của AI', categories: ['mindset'] },
    { criteria: 'Kỹ năng tư duy phản biện và trình bày', categories: ['mindset', 'skillset'] },
  ];

  for (const link of criteriaCategoryLinks) {
    for (const category of link.categories) {
      await prisma.criteriaCategory.upsert({
        where: {
          categoryId_criteriaId: {
            categoryId: categoryMap[category].id,
            criteriaId: criteriaMap[link.criteria].id,
          },
        },
        update: {},
        create: {
          categoryId: categoryMap[category].id,
          criteriaId: criteriaMap[link.criteria].id,
        },
      });
    }
  }

  // 10. Create Questions
  const questionsData = [
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'Phương pháp nào sau đây KHÔNG thuộc về học máy (machine learning)?',
      difficultyLevel: DifficultyLevel.L2,
      criteria: 'Kiến thức nền tảng về AI',
      categories: ['mindset', 'skillset'],
      answerOptions: [
        { content: 'Học giám sát (Supervised Learning)', isCorrect: false },
        { content: 'Học không giám sát (Unsupervised Learning)', isCorrect: false },
        { content: 'Học đối kháng (Adversarial Learning)', isCorrect: false },
        { content: 'Học qua internet (Internet Learning)', isCorrect: true },
      ],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Những công cụ nào dưới đây là những mô hình ngôn ngữ lớn (LLMs)?',
      difficultyLevel: DifficultyLevel.L1,
      criteria: 'Ứng dụng công cụ/mô hình AI',
      categories: ['toolset'],
      answerOptions: [
        { content: 'GPT-4', isCorrect: true },
        { content: 'Claude', isCorrect: true },
        { content: 'Microsoft Excel', isCorrect: false },
        { content: 'Llama 2', isCorrect: true },
        { content: 'Adobe Photoshop', isCorrect: false },
      ],
    },
    {
      type: QuestionType.TRUE_FALSE,
      content:
        'Transfer learning là kỹ thuật sử dụng lại kiến thức từ mô hình đã được huấn luyện trước đó để áp dụng cho bài toán mới.',
      difficultyLevel: DifficultyLevel.L1,
      criteria: 'Kiến thức nền tảng về AI',
      categories: ['skillset'],
      answerOptions: [
        { content: 'Đúng', isCorrect: true },
        { content: 'Sai', isCorrect: false },
      ],
    },
    {
      type: QuestionType.ESSAY,
      content:
        'Hãy mô tả cách bạn sẽ thiết kế một hệ thống AI để hỗ trợ chẩn đoán y tế. Nêu rõ các thành phần, dữ liệu cần thiết và các thách thức tiềm ẩn.',
      difficultyLevel: DifficultyLevel.L4,
      criteria: 'Thiết kế hệ thống hoặc giải pháp AI',
      categories: ['skillset', 'toolset'],
      answerOptions: [],
    },
    {
      type: QuestionType.ESSAY,
      content:
        'Phân tích các tác động xã hội và đạo đức của việc sử dụng hệ thống AI trong quy trình tuyển dụng. Nêu các biện pháp giảm thiểu rủi ro.',
      difficultyLevel: DifficultyLevel.L3,
      criteria: 'Đạo đức và tác động xã hội của AI',
      categories: ['mindset'],
      answerOptions: [],
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      content: 'Công nghệ nào sau đây thường được sử dụng trong các mô hình xử lý ngôn ngữ tự nhiên (NLP)?',
      difficultyLevel: DifficultyLevel.L2,
      criteria: 'Kiến thức nền tảng về AI',
      categories: ['toolset', 'skillset'],
      answerOptions: [
        { content: 'Transformer', isCorrect: true },
        { content: 'Convolutional Neural Networks (CNN)', isCorrect: false },
        { content: 'Attention Mechanism', isCorrect: true },
        { content: 'Random Forest', isCorrect: false },
        { content: 'BERT', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Khi triển khai một mô hình AI vào thực tế, phương pháp nào sau đây là quan trọng nhất để đảm bảo hiệu năng?',
      difficultyLevel: DifficultyLevel.L3,
      criteria: 'Ứng dụng công cụ/mô hình AI',
      categories: ['toolset'],
      answerOptions: [
        { content: 'Tối ưu hóa hyperparameter', isCorrect: false },
        { content: 'Monitoring và cập nhật liên tục', isCorrect: true },
        { content: 'Sử dụng GPU mạnh hơn', isCorrect: false },
        { content: 'Tăng kích thước mô hình', isCorrect: false },
      ],
    },
    {
      type: QuestionType.ESSAY,
      content:
        'Trình bày quan điểm của bạn về tương lai của lao động trong thời đại AI. Những nghề nghiệp nào sẽ bị ảnh hưởng nhiều nhất và con người nên thích nghi như thế nào?',
      difficultyLevel: DifficultyLevel.L4,
      criteria: 'Kỹ năng tư duy phản biện và trình bày',
      categories: ['mindset'],
      answerOptions: [],
    },
    {
      type: QuestionType.TRUE_FALSE,
      content: 'Fine-tuning và prompt engineering là hai phương pháp hoàn toàn khác nhau và không thể kết hợp.',
      difficultyLevel: DifficultyLevel.L2,
      criteria: 'Ứng dụng công cụ/mô hình AI',
      categories: ['toolset', 'skillset'],
      answerOptions: [
        { content: 'Đúng', isCorrect: false },
        { content: 'Sai', isCorrect: true },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      content:
        'Phương pháp nào sau đây KHÔNG phải là một chiến lược để giải quyết vấn đề thiên kiến (bias) trong hệ thống AI?',
      difficultyLevel: DifficultyLevel.L3,
      criteria: 'Đạo đức và tác động xã hội của AI',
      categories: ['mindset'],
      answerOptions: [
        { content: 'Đa dạng hóa dữ liệu huấn luyện', isCorrect: false },
        { content: 'Tăng kích thước mô hình', isCorrect: true },
        { content: 'Kiểm tra và đánh giá công bằng', isCorrect: false },
        { content: 'Thiết kế hệ thống có trách nhiệm', isCorrect: false },
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
        difficultyLevel: qData.difficultyLevel,
        criteriaId: criteriaMap[qData.criteria].id,
      },
    });

    questions.push(question);

    // Link to categories
    for (const catName of qData.categories) {
      await prisma.questionCategory.create({
        data: {
          questionId: question.id,
          categoryId: categoryMap[catName].id,
        },
      });
    }

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
      category: 'mindset',
      domain: 'General',
    },
    {
      title: 'Machine Learning with Python',
      description: 'Learn practical machine learning techniques using Python',
      provider: 'edX',
      url: 'https://www.edx.org/learn/machine-learning',
      category: 'toolset',
      domain: 'General',
    },
    {
      title: 'AI for Healthcare',
      description: 'Applications of AI in healthcare diagnostics and treatment',
      provider: 'Udacity',
      url: 'https://www.udacity.com/course/ai-for-healthcare',
      category: 'skillset',
      domain: 'Healthcare',
    },
    {
      title: 'Financial Analysis with AI',
      description: 'Using AI techniques for financial forecasting and analysis',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/financial-analysis-ai',
      category: 'toolset',
      domain: 'Finance',
    },
    {
      title: 'Critical Thinking for AI Implementation',
      description: 'Developing critical thinking skills for evaluating AI applications',
      provider: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning/critical-thinking-ai',
      category: 'mindset',
      domain: 'General',
    },
    {
      title: 'AI in Manufacturing',
      description: 'Practical applications of AI in manufacturing processes',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-manufacturing',
      category: 'toolset',
      domain: 'Manufacturing',
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
    },
    {
      name: 'AI Ethics and Impact',
      description: 'Assessment focusing on ethical considerations and societal impacts of AI',
      questions: [4, 7, 9], // Indices from the questions array
    },
    {
      name: 'AI Tools and Applications',
      description: 'Assessment of practical AI tools and applications knowledge',
      questions: [1, 3, 6], // Indices from the questions array
    },
    {
      name: 'Comprehensive AI Assessment',
      description: 'Full assessment covering all aspects of AI competency',
      questions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // All questions
    },
  ];

  for (const examSetData of examSetsData) {
    const examSet = await prisma.examSet.create({
      data: {
        name: examSetData.name,
        description: examSetData.description,
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
      email: 'user@example.com',
      examSetName: 'Comprehensive AI Assessment',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      finishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 minutes after start
      totalScore: 68.5,
    },
  ];

  const examSets = await prisma.examSet.findMany();
  const examSetMap = Object.fromEntries(examSets.map((es) => [es.name, es]));

  for (const data of examData) {
    await prisma.exam.create({
      data: {
        userId: userMap[data.email].id,
        examSetId: examSetMap[data.examSetName].id,
        startedAt: data.startedAt,
        finishedAt: data.finishedAt,
        totalScore: data.totalScore,
      },
    });
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
    return new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
  }

  mentorEmails.forEach((mentorEmail, mentorIndex) => {
    for (let i = 0; i < 20; i++) {
      const menteeIndex = (mentorIndex * 20 + i) % userEmails.length;
      mentorBookingsData.push({
        userEmail: userEmails[menteeIndex],
        mentorEmail,
        scheduledAt: randomFutureDate(),
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
    },
    {
      email: 'user1@example.com',
      questionIndex: 2, // True/false question
      answerText: 'Đúng',
      manualScore: null,
      autoScore: 10,
      answerOptionIndex: 0, // The correct option (Đúng)
    },
    {
      email: 'user2@example.com',
      questionIndex: 3, // Essay question
      answerText:
        'Để thiết kế hệ thống AI hỗ trợ chẩn đoán y tế, tôi sẽ xây dựng một hệ thống dựa trên mô hình học sâu kết hợp với quy trình xác thực lâm sàng. Hệ thống sẽ gồm các thành phần: 1) Module thu thập và xử lý dữ liệu hình ảnh y tế, 2) Mô hình AI phân loại và nhận diện bất thường, 3) Hệ thống giải thích kết quả, 4) Interface người dùng thân thiện cho nhân viên y tế. Dữ liệu cần thiết bao gồm datasets hình ảnh y tế được gán nhãn bởi chuyên gia, hồ sơ bệnh án, và thông tin kết quả điều trị. Các thách thức chính bao gồm: bảo mật dữ liệu bệnh nhân, đảm bảo độ chính xác và tin cậy trong chẩn đoán, giải quyết vấn đề thiếu minh bạch trong AI, và tích hợp vào quy trình làm việc hiện tại của các cơ sở y tế.',
      manualScore: 18,
      autoScore: null,
      answerOptionIndex: null, // Essay doesn't have options
    },
    {
      email: 'user@example.com',
      questionIndex: 4, // Essay question about ethics
      answerText:
        'AI trong tuyển dụng có thể cải thiện hiệu quả quy trình nhưng cũng gây ra nhiều vấn đề đạo đức và xã hội. Trước tiên, AI có thể tạo ra thiên kiến khi được huấn luyện trên dữ liệu lịch sử có thể bất công với các nhóm thiểu số. Thứ hai, việc thiếu minh bạch trong quá trình ra quyết định có thể làm ứng viên cảm thấy bị đối xử bất công. Thứ ba, quá phụ thuộc vào AI có thể dẫn đến việc bỏ lỡ những ứng viên tiềm năng có tài năng nhưng không phù hợp với tiêu chí máy móc. Để giảm thiểu rủi ro, các tổ chức cần: đảm bảo dữ liệu huấn luyện đa dạng và công bằng, thiết lập quy trình kiểm tra và đánh giá thường xuyên, kết hợp đánh giá của con người và AI, cung cấp thông tin minh bạch cho ứng viên, và tuân thủ các quy định pháp lý về quyền riêng tư và công bằng trong tuyển dụng.',
      manualScore: 19,
      autoScore: null,
      answerOptionIndex: null, // Essay doesn't have options
    },
    {
      email: 'user@example.com',
      questionIndex: 1, // Multiple choice
      answerText: 'GPT-4, Claude, Llama 2',
      manualScore: null,
      autoScore: 10,
      answerOptionIndex: null,
      answerOptionIndices: [0, 1, 3], // The correct options
    },
  ];

  for (const answerData of sampleUserAnswers) {
    const userAnswer = await prisma.userAnswer.create({
      data: {
        userId: userMap[answerData.email].id,
        questionId: questions[answerData.questionIndex].id,
        answerText: answerData.answerText,
        manualScore: answerData.manualScore,
        autoScore: answerData.autoScore,
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
