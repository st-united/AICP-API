import { PrismaClient, SFIALevel, CompetencyAspect, Level } from '@prisma/client';

export async function seedCompetencySkills(prisma: PrismaClient, aspects: CompetencyAspect[], levels: Level[]) {
  const competencyAspectMap = Object.fromEntries(aspects.map((c) => [c.name, c]));

  const competencySkillData = [
    // Mindset
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 1)',
      description: 'Basic understanding of adaptability and growth mindset concepts in AI context',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 1)',
      description: 'Fundamental concepts of self-learning and continuous improvement in AI',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      description: 'Basic critical thinking and ethical reasoning skills in AI context',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 3)',
      description: 'Applied understanding of human-AI boundaries and interactions',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      description: 'Advanced risk awareness and governance principles in AI implementation',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Tư Duy Chiến Lược AI (Level 5)',
      description: 'Strategic thinking and innovation in AI implementation',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Lãnh Đạo Chuyển Đổi AI (Level 6)',
      description: 'Leadership in AI transformation and organizational change',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Tầm Nhìn & Định Hướng AI (Level 7)',
      description: 'Mastery in AI vision and strategic direction setting',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    // Skillset
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      description: 'Practical skills in AI communication and prompt engineering',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 4)',
      description: 'Advanced research and information synthesis capabilities',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 5)',
      description: 'Expert-level teamwork and human-AI collaboration skills',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      description: 'Advanced data understanding and validation capabilities',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 5)',
      description: 'Expert problem decomposition and AI scoping abilities',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 6)',
      description: 'Leadership in security and privacy implementation for AI systems',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    // Toolset
    {
      name: 'Nhập Môn Công Cụ AI (Level 1)',
      description: 'Introduction to basic AI tools and concepts',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Nền Tảng Công Cụ AI (Level 2)',
      description: 'Foundation knowledge of AI tools and platforms',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Ứng Dụng Công Cụ AI (Level 3)',
      description: 'Practical application of AI tools',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Tích Hợp Công Cụ AI (Level 4)',
      description: 'Integration of various AI tools and platforms',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 5)',
      description: 'Mastery of core AI tools and platforms',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 6)',
      description: 'Leadership in AI tool evaluation and selection',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 6)',
      description: 'Leadership in AI integration and workflow design',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 7)',
      description: 'Mastery in AI innovation and custom development',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
  ];
  await prisma.competencySkill.createMany({
    data: competencySkillData.map((competency) => ({
      name: competency.name,
      description: competency.description,
      sfiaLevel: competency.sfiaLevel,
      categoryId: competencyAspectMap[competency.compatencyAreaName].id,
    })),
    skipDuplicates: false,
  });
}
