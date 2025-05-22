import { PrismaClient, QuestionType, MentorBookingStatus } from '@prisma/client';
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

  // 7. Create Category-Domain relationships
  const categoryDomains = [
    { category: 'mindset', domain: 'General' },
    { category: 'mindset', domain: 'Healthcare' },
    { category: 'mindset', domain: 'Finance' },
    { category: 'toolset', domain: 'General' },
    { category: 'toolset', domain: 'Information Technology' },
    { category: 'skillset', domain: 'Information Technology' },
    { category: 'mindset', domain: 'Information Technology' },
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
      name: 'Kiến thức nền tảng về AI và Machine Learning',
      description: 'Nắm chắc nền tảng, tránh dùng sai AI',
      scoreWeight: 0.2, // 20%
      categoryId: 'mindset',
    },
    {
      name: 'Prompt Engineering và AI Tools',
      description: 'Cốt lõi để dùng AI đúng cách và an toàn',
      scoreWeight: 0.25, // 25%
      categoryId: 'toolset',
    },
    {
      name: 'Phát triển phần mềm và SDLC',
      description: 'Thực hành quan trọng, liên quan trực tiếp đến năng suất',
      scoreWeight: 0.2, // 20%
      categoryId: 'skillset',
    },
    {
      name: 'AI trong quy trình phát triển phần mềm',
      description: 'Tư duy chủ động, cần thiết để tránh sai lệch',
      scoreWeight: 0.2, // 20%
      categoryId: 'skillset',
    },
    {
      name: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      description: 'Đảm bảo tính trung thực, học thuật, rõ ràng',
      scoreWeight: 0.15, // 15%
      categoryId: 'mindset',
    },
  ];

  const criteria = [];
  for (const critData of criteriaData) {
    const criterion = await prisma.criteria.upsert({
      where: { name: critData.name },
      update: {},
      create: {
        name: critData.name,
        description: critData.description,
        scoreWeight: critData.scoreWeight,
        categoryId: categoryMap[critData.categoryId].id,
      },
    });
    criteria.push(criterion);
  }

  const criteriaMap = Object.fromEntries(criteria.map((c) => [c.name, c]));

  // 9. Levels
  const levelsData = [
    {
      name: 'LEVEL_1 - Follow',
      description: 'Làm việc dưới sự hướng dẫn chặt chẽ, thực hiện các nhiệm vụ đơn giản, hỗ trợ các hoạt động cơ bản',
    },
    {
      name: 'LEVEL_2 - Assist',
      description:
        'Thực hiện các nhiệm vụ được giao với một số tự chủ, hỗ trợ đồng nghiệp, làm việc trong quy trình đã định sẵn',
    },
    {
      name: 'LEVEL_3 - Apply',
      description:
        'Xử lý các nhiệm vụ phức tạp hơn, áp dụng kiến thức chuyên môn, chịu trách nhiệm cho công việc cá nhân hoặc nhóm nhỏ',
    },
    {
      name: 'LEVEL_4 - Enable',
      description:
        'Quản lý và dẫn dắt các hoạt động, chịu trách nhiệm về kết quả, hỗ trợ người khác trong công việc chuyên môn',
    },
    {
      name: 'LEVEL_5 - Ensure/Advise',
      description: 'Lãnh đạo dự án hoặc nhóm, cung cấp tư vấn chuyên môn, đảm bảo chất lượng và hiệu quả công việc',
    },
    {
      name: 'LEVEL_6 - Initiate/Influence',
      description: 'Định hình chiến lược, lãnh đạo các sáng kiến lớn, tạo tác động rộng trong tổ chức hoặc ngành',
    },
    {
      name: 'LEVEL_7 - Set Strategy/Inspire',
      description:
        'Thiết lập chiến lược cấp cao, lãnh đạo tổ chức, truyền cảm hứng và thúc đẩy thay đổi ở cấp độ ngành hoặc toàn cầu',
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

  // 10. Create Questions
  const questionsData = [
    // Part 1
    {
      type: QuestionType.SINGLE_CHOICE,
      content: 'AI Generative là gì?',
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Kiến thức nền tảng về AI và Machine Learning',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Prompt Engineering và AI Tools',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Phát triển phần mềm và SDLC',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'AI trong quy trình phát triển phần mềm',
      categories: ['toolset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['skillset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['skillset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['mindset'],
      answerOptions: [
        { content: 'Lo lắng vì AI sẽ thay thế công việc của mình', isCorrect: false },
        { content: 'Lạc quan thái quá, tin rằng AI sẽ giải quyết mọi vấn đề', isCorrect: false },
        { content: 'Tò mò, học hỏi liên tục và thích nghi với công nghệ mới', isCorrect: true },
        { content: 'Thờ ơ vì cho rằng AI chỉ là xu hướng tạm thời', isCorrect: false },
      ],
    },
    {
      type: QuestionType.SINGLE_CHOICE,
      level: 'LEVEL_1 - Follow',
      content:
        'Với việc AI có thể tạo ra code nhanh chóng, điều quan trọng nhất developer cần tập trung phát triển là:',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['skillset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['skillset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['mindset'],
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
      level: 'LEVEL_1 - Follow',
      criteria: 'Mindset khi ứng dụng AI trong phát triển phần mềm',
      categories: ['mindset'],
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
        criteriaId: criteriaMap[qData.criteria].id,
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
      title: 'AI in Information Technology',
      description: 'Practical applications of AI in Information Technology processes',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-Information Technology',
      category: 'toolset',
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
      name: 'AI FOR DEVELOPER - BÀI KIỂM TRA ĐÁNH GIÁ ĐẦU VÀO',
      description:
        'Bài kiểm tra đánh giá đầu vào cho các bạn đã có kiến thức về AI, là developer và muốn nâng cao kiến thức về AI',
      questions: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
      ], // All questions
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
      examSetName: 'AI FOR DEVELOPER - BÀI KIỂM TRA ĐÁNH GIÁ ĐẦU VÀO',
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

  const mentorBookingsData = [
    {
      userEmail: 'user@example.com',
      mentorEmail: 'mentor1@example.com',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
      status: MentorBookingStatus.ACCEPTED,
      notes: 'Discussion about AI career path and required skills',
    },
    {
      userEmail: 'user1@example.com',
      mentorEmail: 'mentor1@example.com',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      status: MentorBookingStatus.PENDING,
      notes: 'Help with practical ML project implementation',
    },
    {
      userEmail: 'user2@example.com',
      mentorEmail: 'admin@example.com',
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      status: MentorBookingStatus.ACCEPTED,
      notes: 'Guidance on ethical considerations in healthcare AI',
    },
  ];

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
