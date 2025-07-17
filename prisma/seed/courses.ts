import { PrismaClient, CompetencyAspect, Domain, SFIALevel } from '@prisma/client';
import { link } from 'joi';

export async function seedCourses(prisma: PrismaClient, categories: CompetencyAspect[], domains: Domain[]) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c]));
  const domainMap = Object.fromEntries(domains.map((d) => [d.name, d]));

  const coursesData = [
    {
      title: 'AI - READINESS MINDSET',
      description:
        'Chương trình đào tạo được thiết kế để giúp học viên làm rõ nhận thức về AI, xây dựng tư duy sẵn sàng và định vị bản thân trong thời đại kỷ nguyên số. Tham gia để bắt đầu hành trình chuyển đồi cùng AI đầy cảm hứng!',
      provider: 'Coursera',
      url: 'https://learn.devplus.edu.vn/',
      linkImage:
        'https://cdn.prod.website-files.com/66c6452d74566f59fa0c6757/682319e4c0a4c6a7346a4769_Visual%20of%20AI-driven%20mindset%20shift%20for%20business%20growth%20with%20Sarvadhi%20branding.png',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Information Technology',
      sfiaLevels: [SFIALevel.LEVEL_1_AWARENESS, SFIALevel.LEVEL_2_FOUNDATION, SFIALevel.LEVEL_3_APPLICATION],
    },
    {
      title: 'APPLY AI FOR DEV',
      description:
        'Chương trình đào tạo được thiết kế để trang bị cho học viên kỹ năng ứng dụng AI thực tiễn trong phát triển phần mềm, mở ra cơ hội nâng cao hiệu suất và tối ưu hóa công việc. Bạn đã sẵn sàng trở thành một lập trình viên AI - Powered, dẫn đầu trong kỷ nguyên công nghệ mới chưa?',
      provider: 'Coursera',
      url: 'https://learn.devplus.edu.vn/',
      linkImage:
        'https://eluminoustechnologies.com/blog/wp-content/uploads/2023/08/How-to-Use-AI-in-Web-Development.webp',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Information Technology',
      sfiaLevels: [SFIALevel.LEVEL_4_INTEGRATION, SFIALevel.LEVEL_5_INNOVATION, SFIALevel.LEVEL_6_LEADERSHIP],
    },
    {
      title: 'Introduction to AI Ethics',
      description: 'A foundational course on ethical considerations in AI development and deployment',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-ethics',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'General',
    },
    {
      title: 'Machine Learning with Python',
      description: 'Learn practical machine learning techniques using Python',
      provider: 'edX',
      url: 'https://www.edx.org/learn/machine-learning',
      category: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
      domain: 'General',
    },
    {
      title: 'AI for Healthcare',
      description: 'Applications of AI in healthcare diagnostics and treatment',
      provider: 'Udacity',
      url: 'https://www.udacity.com/course/ai-for-healthcare',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'Healthcare',
    },
    {
      title: 'Financial Analysis with AI',
      description: 'Using AI techniques for financial forecasting and analysis',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/financial-analysis-ai',
      category: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
      domain: 'Finance',
    },
    {
      title: 'Critical Thinking for AI Implementation',
      description: 'Developing critical thinking skills for evaluating AI applications',
      provider: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning/critical-thinking-ai',
      category: 'Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)',
      domain: 'General',
    },
    {
      title: 'AI in Information Technology',
      description: 'Practical applications of AI in Information Technology processes',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/ai-Information Technology',
      category: 'Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)',
      domain: 'Information Technology',
    },
  ];

  await prisma.course.createMany({
    data: coursesData.map((courseData) => ({
      title: courseData.title,
      description: courseData.description,
      provider: courseData.provider,
      url: courseData.url,
      linkImage: courseData.linkImage || null,
      aspectId: categoryMap[courseData.category].id,
      domainId: domainMap[courseData.domain].id,
      sfiaLevels: courseData.sfiaLevels ?? [],
    })),
  });
}
