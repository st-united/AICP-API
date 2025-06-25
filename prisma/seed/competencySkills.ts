import { PrismaClient, SFIALevel, CompetencyAspect } from '@prisma/client';

export async function seedCompetencySkills(prisma: PrismaClient, aspects: CompetencyAspect[]) {
  const competencyAspectMap = Object.fromEntries(aspects.map((c) => [c.name, c]));

  const competencySkillData = [
    // Mindset
    // Khả Năng Thích Ứng & Tư Duy Phát Triển
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 1)',
      description: 'Basic understanding of adaptability and growth mindset concepts in the context of AI evolution.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 2)',
      description: 'Ability to apply adaptability and growth mindset principles in simple AI-related scenarios.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 3)',
      description: 'Proficient in adapting to AI-driven changes and demonstrating a consistent growth mindset.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 4)',
      description: 'Integrates adaptability and growth mindset into complex AI projects, mentoring others.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 5)',
      description: 'Innovates new approaches to adaptability and growth mindset in AI contexts.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 6)',
      description: 'Leads organizational strategies for fostering adaptability and growth mindset in AI adoption.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },
    {
      name: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Level 7)',
      description: 'Mastery in shaping global AI adaptability and growth mindset frameworks.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
    },

    // Tự Học & Cải Tiến Liên Tục
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 1)',
      description: 'Basic awareness of self-learning and continuous improvement in AI-related knowledge.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 2)',
      description: 'Applies self-learning techniques to acquire foundational AI skills.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 3)',
      description: 'Consistently improves AI knowledge and skills through structured self-learning.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 4)',
      description: 'Integrates self-learning into team AI development, guiding others in improvement.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 5)',
      description: 'Innovates self-learning methodologies to advance AI knowledge organization-wide.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 6)',
      description: 'Leads strategic initiatives for continuous AI learning across the organization.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },
    {
      name: 'Tự Học & Cải Tiến Liên Tục (Level 7)',
      description: 'Mastery in creating global frameworks for AI self-learning and improvement.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement)',
    },

    // Tư Duy Phản Biện & Lý Luận Đạo Đức
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 1)',
      description: 'Basic understanding of critical thinking and ethical reasoning in AI contexts.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 2)',
      description: 'Applies basic critical thinking and ethical principles to AI decision-making.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 3)',
      description: 'Proficient in applying critical thinking and ethical reasoning to AI development.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 4)',
      description: 'Integrates advanced critical thinking and ethics into AI project governance.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 5)',
      description: 'Innovates ethical frameworks for critical decision-making in AI applications.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 6)',
      description: 'Leads organization-wide ethical AI strategies and critical thinking initiatives.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },
    {
      name: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Level 7)',
      description: 'Mastery in shaping global AI ethical and critical thinking standards.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
    },

    // Trí Tuệ Ranh Giới Con Người-AI
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 1)',
      description: 'Basic awareness of the boundaries between human and AI intelligence.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 2)',
      description: 'Understands and applies basic human-AI boundary concepts in AI interactions.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 3)',
      description: 'Proficient in managing human-AI interactions within defined boundaries.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 4)',
      description: 'Integrates human-AI boundary intelligence into collaborative AI systems.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 5)',
      description: 'Innovates new models for human-AI collaboration and boundary management.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 6)',
      description: 'Leads strategies for optimizing human-AI boundaries in organizational AI systems.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },
    {
      name: 'Trí Tuệ Ranh Giới Con Người-AI (Level 7)',
      description: 'Mastery in defining global standards for human-AI boundary intelligence.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)',
    },

    // Nhận Thức Rủi Ro & Quản Trị AI
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 1)',
      description: 'Basic awareness of risks and governance principles in AI implementation.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 2)',
      description: 'Applies basic risk awareness to support AI governance in simple scenarios.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 3)',
      description: 'Proficient in identifying and mitigating AI risks within governance frameworks.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 4)',
      description: 'Integrates AI governance and risk management into project execution.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 5)',
      description: 'Innovates AI risk management strategies and governance frameworks.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 6)',
      description: 'Leads organization-wide AI risk management and governance initiatives.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    {
      name: 'Nhận Thức Rủi Ro & Quản Trị AI (Level 7)',
      description: 'Mastery in shaping global AI risk awareness and governance standards.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)',
    },
    // Skillset
    // Giao Tiếp AI & Prompt Engineering
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 1)',
      description: 'Basic understanding of AI communication principles and prompt design concepts.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 2)',
      description: 'Applies basic prompt engineering techniques to interact with AI systems effectively.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 3)',
      description: 'Proficient in designing prompts to achieve consistent and accurate AI responses.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 4)',
      description: 'Integrates advanced prompt engineering into AI workflows, guiding others in best practices.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 5)',
      description: 'Innovates new prompt engineering strategies to optimize AI system performance.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 6)',
      description: 'Leads organizational strategies for AI communication and prompt engineering frameworks.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },
    {
      name: 'Giao Tiếp AI & Prompt Engineering (Level 7)',
      description: 'Mastery in shaping global standards for AI communication and prompt engineering.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)',
    },

    // Nghiên Cứu & Tổng Hợp Thông Tin
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 1)',
      description: 'Basic awareness of research and information synthesis techniques for AI technologies.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 2)',
      description: 'Applies basic research methods to gather and synthesize AI-related information.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 3)',
      description: 'Proficient in synthesizing complex AI information from diverse research sources.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 4)',
      description: 'Integrates research and synthesis into AI project planning, mentoring team members.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 5)',
      description: 'Innovates research methodologies to advance AI knowledge synthesis.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 6)',
      description: 'Leads strategic AI research and synthesis initiatives across the organization.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },
    {
      name: 'Nghiên Cứu & Tổng Hợp Thông Tin (Level 7)',
      description: 'Mastery in defining global AI research and information synthesis frameworks.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)',
    },

    // Làm Việc Nhóm & Hợp Tác AI-Con Người
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 1)',
      description: 'Basic understanding of teamwork and human-AI collaboration principles.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 2)',
      description: 'Applies basic teamwork skills to support human-AI collaborative tasks.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 3)',
      description: 'Proficient in facilitating effective human-AI collaboration within teams.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 4)',
      description: 'Integrates human-AI collaboration into team workflows, guiding others.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 5)',
      description: 'Innovates new models for human-AI teamwork and collaboration.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 6)',
      description: 'Leads organizational strategies for human-AI collaborative frameworks.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },
    {
      name: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Level 7)',
      description: 'Mastery in shaping global standards for human-AI teamwork and collaboration.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)',
    },

    // Hiểu Biết Dữ Liệu & Xác Thực
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 1)',
      description: 'Basic awareness of data understanding and validation principles in AI systems.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 2)',
      description: 'Applies basic techniques to understand and validate AI system data.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 3)',
      description: 'Proficient in analyzing and validating complex data for AI applications.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 4)',
      description: 'Integrates data validation processes into AI system development, mentoring others.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 5)',
      description: 'Innovates data validation methodologies for advanced AI applications.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 6)',
      description: 'Leads organizational strategies for AI data understanding and validation.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },
    {
      name: 'Hiểu Biết Dữ Liệu & Xác Thực (Level 7)',
      description: 'Mastery in defining global standards for AI data understanding and validation.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)',
    },

    // Phân Tách Vấn Đề & Xác Định Phạm Vi AI
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 1)',
      description: 'Basic understanding of problem decomposition and AI scoping concepts.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 2)',
      description: 'Applies basic problem decomposition to define AI application scope.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 3)',
      description: 'Proficient in breaking down complex problems and scoping AI solutions.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 4)',
      description: 'Integrates problem decomposition into AI project planning, guiding teams.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 5)',
      description: 'Innovates approaches to problem decomposition and AI scoping for complex challenges.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 6)',
      description: 'Leads strategic AI scoping and problem decomposition across the organization.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },
    {
      name: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Level 7)',
      description: 'Mastery in shaping global standards for AI problem decomposition and scoping.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)',
    },

    // Năng Lực Bảo Mật & Quyền Riêng Tư
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 1)',
      description: 'Basic awareness of security and privacy principles in AI systems.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 2)',
      description: 'Applies basic security and privacy measures in AI system development.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 3)',
      description: 'Proficient in implementing security and privacy protocols for AI applications.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 4)',
      description: 'Integrates security and privacy measures into AI system design, mentoring others.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 5)',
      description: 'Innovates security and privacy solutions for advanced AI systems.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 6)',
      description: 'Leads organizational strategies for AI security and privacy frameworks.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    {
      name: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Level 7)',
      description: 'Mastery in defining global standards for AI security and privacy.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)',
    },
    // Toolset
    // Thành Thạo Công Cụ AI Cốt Lõi
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 1)',
      description: 'Basic awareness of core AI tools and platforms used in AI development.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 2)',
      description: 'Applies basic proficiency in using core AI tools for simple tasks.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 3)',
      description: 'Proficient in leveraging core AI tools for complex AI development tasks.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 4)',
      description: 'Integrates core AI tools into advanced workflows, mentoring others in their use.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 5)',
      description: 'Innovates new applications of core AI tools to enhance project outcomes.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 6)',
      description: 'Leads organizational strategies for adopting and optimizing core AI tools.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },
    {
      name: 'Thành Thạo Công Cụ AI Cốt Lõi (Level 7)',
      description: 'Mastery in shaping global standards for core AI tool usage and proficiency.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)',
    },

    // Đánh Giá & Lựa Chọn Công Cụ
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 1)',
      description: 'Basic understanding of criteria for evaluating and selecting AI tools.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 2)',
      description: 'Applies basic evaluation techniques to select AI tools for specific tasks.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 3)',
      description: 'Proficient in evaluating and selecting AI tools based on complex project requirements.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 4)',
      description: 'Integrates tool evaluation into AI project planning, guiding teams in selection.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 5)',
      description: 'Innovates evaluation frameworks for selecting advanced AI tools.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 6)',
      description: 'Leads organizational strategies for AI tool evaluation and selection processes.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },
    {
      name: 'Đánh Giá & Lựa Chọn Công Cụ (Level 7)',
      description: 'Mastery in defining global standards for AI tool evaluation and selection.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    },

    // Tích Hợp & Thiết Kế Quy Trình
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 1)',
      description: 'Basic awareness of AI tool integration and workflow design principles.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 2)',
      description: 'Applies basic techniques to integrate AI tools into simple workflows.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 3)',
      description: 'Proficient in designing efficient workflows with integrated AI tools.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 4)',
      description: 'Integrates AI tools into complex workflows, mentoring teams in design.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 5)',
      description: 'Innovates workflow designs to optimize AI tool integration.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 6)',
      description: 'Leads organizational strategies for AI tool integration and workflow optimization.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },
    {
      name: 'Tích Hợp & Thiết Kế Quy Trình (Level 7)',
      description: 'Mastery in shaping global standards for AI tool integration and workflow design.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)',
    },

    // Đổi Mới & Phát Triển Tùy Chỉnh
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 1)',
      description: 'Basic understanding of innovation and custom AI solution development concepts.',
      sfiaLevel: SFIALevel.LEVEL_1_AWARENESS,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 2)',
      description: 'Applies basic techniques to develop simple custom AI solutions.',
      sfiaLevel: SFIALevel.LEVEL_2_FOUNDATION,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 3)',
      description: 'Proficient in developing innovative custom AI solutions for specific needs.',
      sfiaLevel: SFIALevel.LEVEL_3_APPLICATION,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 4)',
      description: 'Integrates custom AI development into broader innovation strategies, guiding teams.',
      sfiaLevel: SFIALevel.LEVEL_4_INTEGRATION,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 5)',
      description: 'Innovates advanced custom AI solutions to address complex challenges.',
      sfiaLevel: SFIALevel.LEVEL_5_INNOVATION,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 6)',
      description: 'Leads organizational strategies for custom AI development and innovation.',
      sfiaLevel: SFIALevel.LEVEL_6_LEADERSHIP,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
    {
      name: 'Đổi Mới & Phát Triển Tùy Chỉnh (Level 7)',
      description: 'Mastery in shaping global standards for AI innovation and custom development.',
      sfiaLevel: SFIALevel.LEVEL_7_MASTERY,
      compatencyAreaName: 'Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)',
    },
  ];
  await prisma.competencySkill.createMany({
    data: competencySkillData.map((competency) => ({
      name: competency.name,
      description: competency.description,
      sfiaLevel: competency.sfiaLevel,
      aspectId: competencyAspectMap[competency.compatencyAreaName].id,
    })),
    skipDuplicates: false,
  });
}
